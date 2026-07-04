import os
import xml.etree.ElementTree as ET
import glob
import shutil
import random
from pathlib import Path
import torch
import yaml

def parse_xml_to_yolo(xml_file, output_txt_path, class_mapping, default_w=640, default_h=640):
    """Parses PASCAL VOC XML annotations and writes them in normalized YOLO format."""
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        # Read image size from XML
        size = root.find("size")
        img_width, img_height = default_w, default_h
        if size is not None:
            w_elem = size.find("width")
            h_elem = size.find("height")
            if w_elem is not None and int(w_elem.text) > 0:
                img_width = int(w_elem.text)
            if h_elem is not None and int(h_elem.text) > 0:
                img_height = int(h_elem.text)

        lines = []
        for obj in root.findall("object"):
            class_name = obj.find("name").text.strip().lower()
            if class_name not in class_mapping:
                continue
            class_id = class_mapping[class_name]

            bbox = obj.find("bndbox")
            if bbox is None:
                continue
            
            xmin = float(bbox.find("xmin").text)
            ymin = float(bbox.find("ymin").text)
            xmax = float(bbox.find("xmax").text)
            ymax = float(bbox.find("ymax").text)

            # Safeguard bounding box limits
            xmin = max(0.0, min(xmin, img_width))
            xmax = max(0.0, min(xmax, img_width))
            ymin = max(0.0, min(ymin, img_height))
            ymax = max(0.0, min(ymax, img_height))

            # Bounding box dimensions must be valid
            if xmax <= xmin or ymax <= ymin:
                continue

            # Calculate normalized YOLO coordinates
            x_center = ((xmin + xmax) / 2.0) / img_width
            y_center = ((ymin + ymax) / 2.0) / img_height
            width = (xmax - xmin) / img_width
            height = (ymax - ymin) / img_height

            # Clip normalized coordinates between 0 and 1
            x_center = max(0.0, min(x_center, 1.0))
            y_center = max(0.0, min(y_center, 1.0))
            width = max(0.0, min(width, 1.0))
            height = max(0.0, min(height, 1.0))

            lines.append(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")

        # Only write if annotations exist
        if lines:
            with open(output_txt_path, "w") as f:
                f.write("\n".join(lines))
            return True
    except Exception as e:
        print(f"Error parsing XML {xml_file}: {e}")
    return False

def prepare_yolo_dataset(source_dir, dest_dir, max_samples=None, train_ratio=0.8):
    """Finds image-annotation pairs, splits them, and converts them to YOLO format."""
    source_dir = Path(source_dir)
    dest_dir = Path(dest_dir)

    print("--- Searching for image and XML files recursively ---")
    xml_files = sorted(glob.glob(str(source_dir / "**" / "*.xml"), recursive=True))
    
    # Create image file list
    image_exts = ["*.jpg", "*.jpeg", "*.png"]
    image_files = []
    for ext in image_exts:
        image_files.extend(glob.glob(str(source_dir / "**" / ext), recursive=True))
    image_files = sorted(image_files)

    print(f"Total XML annotations found: {len(xml_files)}")
    print(f"Total image files found: {len(image_files)}")

    # Map stems to XML file paths
    xml_map = {Path(x).stem: Path(x) for x in xml_files}

    # Pair images and annotations
    pairs = []
    for img_path_str in image_files:
        img_path = Path(img_path_str)
        # Avoid including any images that are inside the destination folder itself
        if dest_dir in img_path.parents:
            continue
        if img_path.stem in xml_map:
            pairs.append((img_path, xml_map[img_path.stem]))

    print(f"Successfully matched and paired: {len(pairs)} image-annotation sets.")
    if not pairs:
        raise ValueError("No matching image-annotation pairs found!")

    # Shuffle and subset dataset
    random.seed(42)
    random.shuffle(pairs)
    if max_samples is not None:
        pairs = pairs[:max_samples]
        print(f"Restricted dataset to max_samples={max_samples}")

    # Determine unique classes dynamically
    discovered_classes = set()
    for _, xml_path in pairs:
        try:
            tree = ET.parse(xml_path)
            for obj in tree.getroot().findall("object"):
                name_elem = obj.find("name")
                if name_elem is not None:
                    discovered_classes.add(name_elem.text.strip().lower())
        except Exception:
            pass

    sorted_classes = sorted(list(discovered_classes))
    class_mapping = {name: idx for idx, name in enumerate(sorted_classes)}
    print(f"Discovered classes: {sorted_classes}")
    print(f"Class mapping: {class_mapping}")

    # Create YOLO directory structure
    for split in ["train", "val"]:
        (dest_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (dest_dir / "labels" / split).mkdir(parents=True, exist_ok=True)

    # Split into train and validation sets
    split_idx = int(len(pairs) * train_ratio)
    train_pairs = pairs[:split_idx]
    val_pairs = pairs[split_idx:]

    def process_subset(subset_pairs, split_name):
        count = 0
        for img_path, xml_path in subset_pairs:
            dest_img = dest_dir / "images" / split_name / img_path.name
            dest_lbl = dest_dir / "labels" / split_name / f"{img_path.stem}.txt"
            
            # Copy image
            shutil.copy2(str(img_path), str(dest_img))
            # Convert XML and write label
            if parse_xml_to_yolo(xml_path, dest_lbl, class_mapping):
                count += 1
            else:
                # If XML conversion failed or had no classes, clean up the copied image
                if dest_img.exists():
                    dest_img.unlink()
        print(f"Structured {count} image-annotation sets in '{split_name}' subset.")
        return count

    print("--- Processing training split ---")
    train_count = process_subset(train_pairs, "train")
    print("--- Processing validation split ---")
    val_count = process_subset(val_pairs, "val")

    # Generate dataset.yaml
    yaml_content = {
        "path": str(dest_dir.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": {idx: name for name, idx in class_mapping.items()}
    }
    
    yaml_path = dest_dir / "dataset.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(yaml_content, f, default_flow_style=False)
    print(f"Generated dataset config at: {yaml_path.resolve()}")

    return yaml_path, class_mapping

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Local YOLOv8 Training Script for Seed Vigor Dataset")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size for training")
    parser.add_argument("--max-samples", type=int, default=2000, help="Limit dataset size for local training (None for all)")
    parser.add_argument("--device", type=str, default="auto", help="Execution device: auto, cpu, mps, or cuda")
    args = parser.parse_args()

    # Define paths
    source_dataset_dir = "/Users/Apple/soilsec copy/data/archive (9)"
    yolo_dataset_dir = "/Users/Apple/soilsec copy/data/yolo_dataset"

    # 1. Prepare YOLO dataset
    yaml_path, class_mapping = prepare_yolo_dataset(
        source_dataset_dir, 
        yolo_dataset_dir, 
        max_samples=args.max_samples if args.max_samples > 0 else None
    )

    # 2. Hardware acceleration auto-detection
    device = args.device.lower()
    if device == "auto":
        if torch.backends.mps.is_available():
            device = "mps"
        elif torch.cuda.is_available():
            device = "0"
        else:
            device = "cpu"
    print(f"\n--- Selected hardware device: {device.upper()} ---")

    # 3. Train YOLOv8 Model
    from ultralytics import YOLO
    
    print("\n--- Initializing YOLOv8 Nano model (yolov8n.pt) ---")
    model = YOLO("yolov8n.pt")

    print(f"\n--- Starting training for {args.epochs} epochs (batch={args.batch}) ---")
    results = model.train(
        data=str(yaml_path),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=640,
        device=device,
        project="/Users/Apple/soilsec copy/runs",
        name="seed_vigor_detection"
    )

    print("\n--- Training Finished! Running Validation ---")
    # Dynamically resolve best weights from the current run directory
    best_weights = Path(results.save_dir) / "weights" / "best.pt"
    
    if best_weights.exists():
        best_model = YOLO(str(best_weights))
        metrics = best_model.val()
        
        # Calculate performance metrics
        precision = metrics.box.mp
        recall = metrics.box.mr
        map50 = metrics.box.map50
        map95 = metrics.box.map
        
        if precision + recall > 0:
            f1_score = 2 * (precision * recall) / (precision + recall)
        else:
            f1_score = 0.0
            
        print("\n=================== LOCAL VALIDATION RESULTS ===================")
        print(f"Precision (P):       {precision:.4f}")
        print(f"Recall (R):          {recall:.4f}")
        print(f"F1-Score:            {f1_score:.4f}")
        print(f"mAP@50:              {map50:.4f}")
        print(f"mAP@50-95:           {map95:.4f}")
        print("================================================================\n")

        # 4. Export to TFLite (FP16 quantized) for offline mobile/edge use
        print("--- Exporting best trained checkpoint to TFLite format (FP16 half-precision) ---")
        try:
            tflite_path = best_model.export(format="tflite", int8=False, half=True)
            print(f"TFLite model exported to: {tflite_path}")
            
            # Copy to the weights folder for easy access
            shutil.copy2(tflite_path, "/Users/Apple/soilsec copy/weights/best_seed_vigor_fp16.tflite")
            print("Successfully copied best_seed_vigor_fp16.tflite to weights folder!")
        except Exception as e:
            print("\n========================= WARNING =========================")
            print("TFLite export failed or is not supported on this platform/python version.")
            print(f"Details: {e}")
            print("The model weights have been successfully trained and saved at:")
            print(f"  {best_weights}")
            print("You can copy these weights to a Linux environment or a Python < 3.13 environment to export to TFLite.")
            print("===========================================================\n")
    else:
        print("Warning: Trained best.pt weights file was not found, skipping validation/export.")

if __name__ == "__main__":
    main()
