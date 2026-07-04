ALU
SEEDSEC RWANDA: A HYBRID ONLINE AND OFFLINE SMARTPHONE-BASED SEED QUALITY DIAGNOSIS AND ADVISORY SYSTEM FOR SMALLHOLDER FARMERS AND AGRO-DEALERS
BSc. in Software EngineeringCapstone Research Proposal
**BSc. in Software Engineering Capstone Research Proposal****Prepared By:**BSc. Software Engineering Candidate**Supervisor:**Faculty Supervisor**Date:**May 2026**African Leadership University (ALU), Kigali, Rwanda**

Table of Contents
* Abstract
* Chapter One: Introduction
* 1.1 Introduction and Background
* 1.2 Problem Statement
* 1.3 Project’s Main Objective
* 1.3.1 List of the Specific Objectives
* 1.4 Research Questions
* 1.5 Project Scope
* 1.6 Significance and Justification
* 1.7 Research Budget
* 1.8 Research Timeline
* Chapter Two: Literature Review
* 2.1 Introduction
* 2.3 Overview of Existing Systems
* 2.4 Review of Related Work
* 2.4.1 Summary of Reviewed Literature
* 2.4.2 Comparative Analysis of Machine Learning Architectures
* 2.5 Strengths and Weakness of the Existing System(s)
* 2.6 General Comment and Conclusion
* Chapter Three: System Analysis and Design
* 3.1 Introduction
* 3.2 Research Design
* 3.4 System Architecture
* 3.5 UML Diagrams
* 3.6 Development Tools
* References

List of Tables
* Table 1.1: Research Budget Breakdown
* Table 1.2: Research Project Timeline (Gantt Chart representation)
* Table 2.1: Summary Matrix of Reviewed Literature
* Table 2.2: Comparison Matrix of Strengths and Weaknesses of Existing Systems
* Table 3.1: Database Schema Definitions

List of Figures
* Figure 3.0: SeedSec Rwanda Research Design Process
* Figure 3.1: SeedSec Rwanda System Architecture Diagram
* Figure 3.2: SeedSec Rwanda Use Case Diagram
* Figure 3.3: SeedSec Rwanda Class Diagram
* Figure 3.4: SeedSec Rwanda Entity Relationship Diagram (ERD)
* Figure 3.5: SeedSec Rwanda Sequence Diagram for Seed Quality and Health Diagnosis

List of Acronyms/Abbreviations
* ALU: African Leadership University
* API: Application Programming Interface
* BSc: Bachelor of Science
* CBAM: Convolutional Block Attention Module
* CNN: Convolutional Neural Network
* GDP: Gross Domestic Product
* ISTA: International Seed Testing Association
* mAP: Mean Average Precision
* ML: Machine Learning
* ONNX: Open Neural Network Exchange
* PWA: Progressive Web Application
* RAB: Rwanda Agriculture and Animal Resources Development Board
* RGB: Red-Green-Blue
* TFLite: TensorFlow Lite
* UI/UX: User Interface / User Experience
* UML: Unified Modeling Language
* YOLO: You Only Look Once

ABSTRACT
Seed quality is a major constraint to agricultural productivity in Rwanda, where approximately 70% of smallholders rely on saved or informal seed sources, leading to yield deficits of up to 35% due to poor vigor and seed-borne pathogens. While formal certified seeds exist, farmers lack accessible, real-time tools to assess seed quality prior to planting. This project introduces SeedSec Rwanda, a hybrid online and offline smartphone prototype using computer vision to support on-farm seed quality and variety screening for smallholders and local agro-dealers. The system combines: (i) a cloud-hosted web application backed by a FastAPI service running PyTorch models for online classification, and (ii) an offline mobile application utilizing compressed TensorFlow Lite (TFLite) models for local edge-inference in disconnected rural fields. A YOLO-based model classifies maize seed vigor stages during germination, while two CNN classifiers detect corn seed defects and 14 vegetable varieties. Based on the diagnostics, the system generates actionable management recommendations (e.g., use, treat, or replace seeds). The prototype will be evaluated using technical model metrics (targeting an F1-score > 85% on held-out test data) and qualitative usability feedback from a convenience sample of 30 farmers and agro-dealers in the Gasabo District, Kigali. By providing near-instant, zero-cost, image-based diagnostics, SeedSec Rwanda aims to empower local stakeholders in making informed seed-selection decisions.

CHAPTER ONE: INTRODUCTION
1.1 Introduction and Background
Agriculture is the cornerstone of Rwanda’s economy and rural livelihoods, contributing approximately 25% of the national Gross Domestic Product (GDP) and employing over 70% of the active population. Smallholder farmers cultivate the vast majority of Rwanda's arable land, managing small, fragmented plots under intense land pressure and growing climate variability. To increase yields and meet national food security goals, the Government of Rwanda has promoted input intensification, including mineral fertilizers and improved seeds. However, the efficiency of these inputs is strongly conditioned by the quality of seed used at planting. If seed quality is poor—low vigor, low germination, or infected with seed-borne diseases—subsequent investments in fertilizers and labor fail to translate into higher yields.
In Rwanda, access to quality seed remains a challenge. Over 70% of smallholders continue to rely on saved seeds or informal markets, where seed lots are highly variable in terms of purity and health. Visual inspection, the traditional method, is subjective, inconsistent, and fails to detect latent diseases. While formal certified seeds exist, farmers lack simple, field-level tools to verify seed quality. Conventional laboratory testing standard methods, regulated by the Rwanda Agriculture Board (RAB) and following ISTA guidelines, require specialized equipment and take 7–14 days. These services are largely inaccessible to smallholder farmers and rural agro-dealers who need immediate, low-cost decisions at planting time.
Recent advances in computer vision, deep learning, and mobile technology have enabled edge-AI execution. By compressing trained convolutional neural networks (CNNs) using quantization (converting weights from FP32 to INT8), deep learning models can run locally on smartphone processors via TensorFlow Lite (TFLite) or ONNX formats. This eliminates the reliance on stable internet, allowing real-time seed diagnostic classifications directly in the field. SeedSec Rwanda is proposed as a hybrid smartphone-based prototype designed to explore whether combining cloud-based web-app inference with local, offline mobile edge-app models can deliver accessible, zero-cost seed diagnostics to smallholders and agro-dealers in Rwanda.
1.2 Problem Statement
Smallholder farmers and agro-dealers in Rwanda face several challenges related to seed quality, which can be grouped into three distinct sub-problems:
First, rural smallholders frequently use saved seeds or informally sourced seed lots of unknown vigor. This leads to poor crop establishment, uneven stands, and yield deficits of up to 35%, wasting investments in land preparation, labor, and expensive fertilizers (RAB, 2024).
Second, manual seed quality inspection is highly subjective and inaccurate. Agro-dealers and farmers lack objective, low-cost screening tools to verify seed varieties or identify physical defects (broken, discolored, or insect-damaged seeds) at scale, while standard laboratory seed tests remain centralized, slow, and expensive.
Third, existing digital agriculture applications rely heavily on high-bandwidth cloud APIs. In rural Rwandan farming sectors, mobile data is expensive and network coverage is frequently unstable, rendering purely online tools unusable for real-time field diagnostics.
To address these combined issues, this work introduces a hybrid online and offline software solution that contains a cloud-hosted web application for high-accuracy online classifications and an offline mobile application running optimized local TFLite models on-device, aiming to deliver immediate, cost-free, on-farm diagnostics.
1.3 Project’s Main Objective
To design, implement, and evaluate the prototype of SeedSec Rwanda, a hybrid online and offline smartphone-based seed quality diagnosis and advisory system for smallholder farmers and agro-dealers that integrates cloud API diagnostics with local mobile edge-inference to identify seed vigor stages, defects, and varieties.
1.3.1 List of the Specific Objectives
1. To understand and review requirements for seed vigor and quality diagnostics among smallholder farmers and agro-dealers in Rwanda.
2. To develop the SeedSec Rwanda hybrid solution, consisting of (i) a cloud FastAPI backend running PyTorch YOLO/CNN models for web diagnostics, and (ii) an offline mobile application loading quantized TFLite models for local edge-inference.
3. To collect and verify results based on measurable metrics, evaluating model accuracy and F1-score (>85%) on held-out test data, alongside measuring offline mobile inference latency and collecting qualitative usability feedback from 30 farmers and agro-dealers in Gasabo District.
1.4 Research Questions
1. How can a hybrid online/offline system be designed to support on-farm seed diagnostics in both connected and disconnected agricultural environments in Rwanda?
2. What classification accuracy and F1-score can be achieved by YOLO and CNN models in identifying maize seed vigor stages, corn defects, and vegetable varieties?
3. What are the technical trade-offs (accuracy loss, model size reduction, latency) of post-training quantization when running offline on edge devices?
4. How do farmers and agro-dealers perceive the usability and usefulness of the prototype?
1.5 Project Scope
* Geographical Scope: The prototype will be configured for Rwanda, with user testing and usability feedback sessions concentrated on a convenience sample of 30 farmers and agro-dealers in the Bumbogo and Kimironko sectors of Gasabo District, Kigali.
* Functional Scope: The software is limited to (i) a cloud web application utilizing FastAPI and PyTorch, and (ii) a mobile edge application executing serialized `.tflite` models locally.
* Scale and Technical Scope: Diagnostics utilize three Kaggle datasets (Maize Vigor, Corn Defects, 14 Vegetable classes) and map results to simple recommendations. The project does not include crop yield trials or formal ISTA seed certifications.
1.6 Significance and Justification
Widespread use of poor-quality seed is a major constraint to agricultural productivity in Rwanda, limiting the effectiveness of inputs like fertilizers and threatening food security. SeedSec Rwanda is significant because it explores an offline-capable, software-only approach that leverages existing datasets and smartphone cameras to approximate seed quality at the field scale without requiring laboratory infrastructure.
Academically, this project provides a practical integration of software engineering and machine learning principles, demonstrating how model quantization and edge deployment can deliver actionable information to users with limited technical background.
Practically, the project aligns with Rwanda's digital agriculture strategies, showing how farmer-facing applications can complement high-level infrastructure. The integration of offline mobile execution ensures the tool is immediately useful for remote extension agents and agro-dealers to verify seed quality directly at the point of sale.
1.7 Research Budget
The budget focuses on computing resources for training models and testing mobile handsets.
Table 1.1: Research Budget Breakdown

| Item Category | Item Description | Estimated Cost (RWF) | Estimated Cost (USD) | Source / Justification |
| --- | --- | --- | --- | --- |
| Computing & Cloud | Google Colab Pro GPU instances (2 months) | 26,000 RWF | $20.00 USD | Accelerated model training |
| Edge Hardware | Testing mobile handsets (used Android devices) | 120,000 RWF | $92.00 USD | Deploying and measuring offline TFLite runs |
| Data & Storage | Mobile data bundles for dataset synchronization | 50,000 RWF | $38.00 USD | Transferring model weights |
| Reporting | Printing and academic thesis compilation | 65,000 RWF | $50.00 USD | Archive copy compilation |
| Total Budget |  | 261,000 RWF | $200.00 USD | Funded by the student researcher |


1.8 Research Timeline
The project is structured over 5 months, balancing training, model compression, and hybrid application development.
Table 1.2: Research Project Timeline (5 Months)

| Phase | Activities | Month 1 | Month 2 | Month 3 | Month 4 | Month 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Phase 1: Modeling | Literature review, model training on Kaggle datasets | [X] |  |  |  |  |
| Phase 2: Compression | Model optimization (quantization, conversion to TFLite) |  | [X] |  |  |  |
| Phase 3: Web App | FastAPI backend & Next.js frontend implementation |  |  | [X] |  |  |
| Phase 4: Mobile App | Mobile integration, local TFLite offline interpreter |  |  |  | [X] |  |
| Phase 5: Evaluation | Comparative evaluation (cloud vs. offline edge) & report |  |  |  |  | [X] |



CHAPTER TWO: LITERATURE REVIEW
2.1 Introduction
The literature review for this project evaluates computer vision techniques and deep learning architectures applied to seed quality analysis, vigor identification, and seed variety classification. The literature search was conducted on academic indexing databases (OpenAlex, EuropePMC, arXiv). The search focused on publications from 2020 onwards, selecting keywords: *"maize seed germination YOLO detection"*, *"vegetable seed type recognition deep learning"*, *"CNN seed vigor grading"*, and *"lightweight neural networks for edge agritech"*. A total of 15 papers were selected to map model architectures, compare classification parameters, and identify deployment pathways for low-resource environments.
2.3 Overview of Existing Systems
Traditional seed evaluation mechanisms and emerging digital tools demonstrate different Trade-offs in accuracy and feasibility:
1. Laboratory Germination Tests (ISTA Standards): Standardized laboratory protocols involving wet paper blotter incubation over 7–14 days. While highly accurate, these tests require specialized equipment, stable temperature incubators, and trained lab technicians. They are slow, expensive, and logistically inaccessible for real-time smallholder decisions.
2. Manual Visual Screening: Traditional on-farm method where farmers look for visual seed defects (mold, insects, cracks). This is highly subjective, labor-intensive, and fails to identify internal vigor levels or distinguish between visually identical seed varieties.
3. Industrial Optical Sorting Machines: High-throughput industrial sorting machines combining multispectral or hyperspectral imaging with deep learning. These systems are highly accurate but cost tens of thousands of dollars, making them centralized solutions restricted to large seed processors.
4. Existing Mobile Disease Detection Tools: Applications like Plantix that utilize CNNs for crop disease diagnosis. These tools demonstrate the viability of mobile computer vision in agriculture but do not currently provide specialized seed classification or germination vigor assessments, and heavily rely on consistent internet connection.
2.4 Review of Related Work
Recent research demonstrates the capabilities of computer vision and deep learning in non-destructive agricultural assessments.
2.4.1 Summary Matrix of Reviewed Literature

| Study Citation | Focus Area | Methodology | Key Findings | Strengths | Weaknesses |
| --- | --- | --- | --- | --- | --- |
| Chen et al. (2024) | Maize seed germination and vigor detection | Constructed 19,800 RGB images annotated in 5 germination classes | Developed baseline models for prediction of primary/secondary roots. | Large, high-resolution dataset with dense bounding box annotations. | Does not optimize models for low-power edge device deployment. |
| Li et al. (2023) | Lightweight maize seed classification | MobileNetV3 integrated with CBAM attention module | Achieved 93.14% classification accuracy across broken, moldy, and damaged seeds. | Highly optimized model size suitable for mobile integration. | Did not test performance on multi-species or vegetable seeds. |
| Wang et al. (2022) | Automated seed variety classification | Multi-pathway CNN classifier trained on RGB variety images | Achieved >95% accuracy in distinguishing variety classes. | Excellent robustness under varied lighting conditions. | Requires high GPU capabilities for training and execution. |
| Frontiers in Plant Science (2023) | Deep learning for seed quality grading | CNN classifier evaluating seed vigor categories (High, Medium, Low) | Demonstrated strong correlation between surface texture features and vigor. | Validates RGB imaging as a low-cost vigor indicator. | High dependency on uniform backgrounds and alignment. |


2.4.2 Comparative Analysis of Machine Learning Architectures
For seed-related tasks, researchers must choose between two paradigms:
1. Single-Stage Object Detectors (YOLOv8/YOLOv9): By using anchor-free detection heads and spatial attention modules, modern YOLO models localize and classify multiple seeds in a single container image. This is highly suitable for tracking germination progression (from "ungerminated" to "secondary root" stages) over time.
2. Classification Backbones (ResNet vs. MobileNet): Residual networks (ResNet50) use skip-connections to solve the vanishing gradient problem, allowing deep feature extraction. This is beneficial for identifying minute cracks or mold details in corn seed defect classification. In contrast, MobileNet architectures use depthwise separable convolutions to reduce parameters, making them ideal for mobile applications distinguishing between vegetable species.
2.5 Strengths and Weaknesses of the Existing Systems
SeedSec Rwanda addresses critical gaps by proposing a multi-dataset approach that integrates vigor detection, defect classification, and variety recognition.
Table 2.2: Comparison Matrix of Existing Systems vs. SeedSec Rwanda

| System | Primary Strengths | Primary Weaknesses | Gaps Addressed by SeedSec Rwanda |
| --- | --- | --- | --- |
| ISTA Lab Testing | Maximum scientific accuracy. | Slow (7-14 days), expensive, centralized. | Concept of a zero-cost, near-instant, mobile-ready diagnostic framework. |
| Industrial Sorters | High speed, multi-spectral detection of internal defects. | Prohibitively expensive hardware, not portable. | Focuses on RGB image datasets compatible with standard smartphone cameras. |
| Manual Screening | Zero financial cost, immediate field execution. | High subjectivity, low accuracy, cannot verify vigor. | Replaces subjective screening with objective, trained deep learning models. |


2.6 General Comment and Conclusion
The literature validates that deep learning models—specifically YOLO for object detection and CNNs (such as ResNet or MobileNet) for image classification—can achieve high accuracy (>90%) on agricultural diagnostic tasks. By using three public datasets, this project builds a technical foundation that integrates three distinct tasks (vigor prediction, defect detection, and species identification) under a unified framework, paving the way for accessible digital seed screening tools.

CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN
3.1 Introduction
This chapter outlines the system architecture, research design, data modeling, and development tools for the SeedSec Rwanda deep learning research prototype.
3.2 Research Design
This project utilizes a Quantitative, Experimental Research Design based on secondary public datasets to build and evaluate the models:

Figure 3.0: SeedSec Rwanda Research Design Process
1. Data Acquisition: Fetching the three target datasets (Seed Vigor Detection, Corn Seed Classification, Vegetable Seed Dataset) from Kaggle via API.
2. Data Preprocessing: Annotating, cropping, resizing, and splitting data (train, validation, test splits) in Google Colab.
3. Model Training & Compression: Training PyTorch models, followed by FP16/INT8 post-training quantization to export `.tflite` files.
4. Performance Evaluation: Comparing cloud vs. offline models in terms of mAP/accuracy, execution latency (ms), model size (MB), and device energy usage.
3.3 Data Acquisition and Preprocessing Pipeline
The image preprocessing pipeline standardizes inputs across three separate source streams:
* Maize Vigor Detection Dataset: The raw images (3456 x 4608) are downscaled to 640 x 640 to fit YOLO inputs. Annotations are converted from PASCAL VOC XML coordinates into normalized YOLO `.txt` format (class, x_center, y_center, width, height).
* Corn Seed Classification Dataset: Images are normalized, resized to 224 x 224 pixels, and subjected to data augmentation policies (random horizontal flip, rotation of ±15 degrees, and color jitter) to handle illumination differences.
* Vegetable Seed Dataset (14 Classes): Images are loaded, categorized into folders representing classes, and split into train (70%), validation (15%), and test (15%) groups, maintaining class balances.
3.4 System Architecture
The high-level research architecture represents the pipeline from data ingestion to model evaluation, alongside the hybrid online and offline execution paths:
* Data Ingestion Layer: Connects Google Colab to the Kaggle API to ingest the three raw image datasets.
* Preprocessing Engine: Resizes images, applies data augmentation (rotation, flipping), and structures annotations.
* Model Pipeline Layer:
* *YOLO Model*: Handles object detection and bounding box prediction for the 5 maize vigor germination stages.
* *Corn CNN Model*: Classifies individual corn kernels into 4 quality classes (Pure, Discolored, Silk Cut, Broken).
* *Vegetable CNN Model*: Classifies vegetable seeds into 14 distinct species classes.
* Evaluation Engine: Generates metrics comparing the standard models with the quantized edge models.
* Hybrid Execution Interface:
* *Online Web Path*: Client sends image via HTTPS POST request to FastAPI backend (running PyTorch/Ultralytics models), returning detailed JSON results.
* *Offline Mobile Path*: Client loads local serialized `.tflite` model files, capturing images and executing local predictions directly via TFLite interpreter, presenting immediate feedback.

Figure 3.1: SeedSec Rwanda System Architecture Diagram
3.5 UML Diagrams
3.5.1 Use Case Diagram
* Actors: Researcher (primary user for training/testing), Farmer / Agro-dealer (conceptual end-users).
* Use Cases:
* *Ingest Seed Datasets*: Importing image libraries.
* *Train/Fine-Tune Models*: Executing model training on GPUs.
* *Evaluate Model Performance*: Visualizing validation graphs and metrics.
* *Cloud Diagnostics (Online)*: Uploading seed photos to cloud for high-performance detection.
* *Edge Diagnostics (Offline)*: Performing real-time local model execution on mobile device without network.

Figure 3.2: SeedSec Rwanda Use Case Diagram
3.5.2 Class Diagram
The core code classes modeling the machine learning pipelines and evaluation tasks are structured as follows:
* `Dataset`: Represents metadata, paths, and preprocessing rules for Maize Vigor, Corn Seed, and Vegetable Seed datasets.
* `TrainingRun`: Represents execution state, hyperparameter maps (batch size, learning rate), and GPU memory utilization.
* `ModelQuantizer`: Coordinates conversion of trained weights into optimized TFLite formats.
* `EvaluationMetric`: Handles computation of accuracy, precision, recall, F1-score, and mean Average Precision.

Figure 3.3: SeedSec Rwanda Class Diagram
3.5.3 Entity Relationship Diagram (ERD)
While the core research is executed on file systems, a metadata tracking schema is designed to record dataset profiles, training parameters, and metrics:

Figure 3.4: SeedSec Rwanda Entity Relationship Diagram (ERD)
Table 3.1: Database Schema Definitions
```
DATASETS (
dataset_id INTEGER PRIMARY KEY AUTOINCREMENT,
name VARCHAR(100),
source_url VARCHAR(255),
total_images INTEGER,
num_classes INTEGER
)
TRAINING_RUNS (
run_id INTEGER PRIMARY KEY AUTOINCREMENT,
dataset_id INTEGER REFERENCES DATASETS(dataset_id),
model_architecture VARCHAR(50),
hyperparameters TEXT,
execution_time REAL,
epochs_trained INTEGER
)
EVALUATION_METRICS (
metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
run_id INTEGER REFERENCES TRAINING_RUNS(run_id),
accuracy REAL,
f1_score REAL,
precision_val REAL,
recall_val REAL,
map_score REAL
)
```
3.5.4 Sequence Diagram for Seed Quality and Health Diagnosis
This sequence diagram tracks the research flow from dataset ingest to model evaluation:
1. Researcher triggers data ingestion via Jupyter Interface (Frontend).
2. Frontend calls the Colab Kernel (Backend) to download data.
3. Backend pulls images from the Kaggle API.
4. Backend sends raw images to the Preprocessing Engine for augmentations and sizing.
5. Backend triggers model training on the ML Pipeline Layer (YOLO and CNN models).
6. ML Pipeline Layer executes training iterations, saving weight checkpoints to Google Drive (Storage).
7. Backend runs tests on held-out splits using the Evaluation Engine.
8. Evaluation Engine calculates performance metrics and writes them to the Database.
9. Backend displays training graphs, confusion matrices, and final performance reports to the Researcher.

Figure 3.5: SeedSec Rwanda Sequence Diagram for Seed Quality and Health Diagnosis
3.6 Development Tools
* Execution Environment: Google Colab (with NVIDIA T4/A100 GPU acceleration) and Jupyter Notebooks.
* Programming Language: Python 3.10.
* Deep Learning Libraries: PyTorch (v2.0+), torchvision, and Ultralytics YOLOv8/9.
* Edge Optimization Tools: TensorFlow Lite Converter, ONNX Runtime Mobile, and Scikit-learn.
* Storage & Versioning: Google Drive (model weights and backups) and GitHub (code repository).

REFERENCES
1. African Leadership University (ALU). (2025). *BSc. in Software Engineering Capstone Project Guidelines and Proposal Template*. ALU Academic Registry, Kigali, Rwanda.
2. Chen, C., Bai, M., Wang, T., Zhang, W., Yu, H., Pang, T., Wu, J., Li, Z., & Wang, X. (2024). An RGB image dataset for seed germination prediction and vigor detection - maize. *Frontiers in Plant Science*, 15:1341335. https://doi.org/10.3389/fpls.2024.1341335
3. Li, Y., Chen, X., & Zhang, Y. (2023). A lightweight network for maize seed defect identification based on MobileNetV3 and attention mechanisms. *Computers and Electronics in Agriculture*, 208, 107789. https://doi.org/10.1016/j.compag.2023.107789
4. Sharma, R., Singh, A., & Dutta, K. (2021). Deep learning applications in seed quality and variety classification: A systematic review. *Multimedia Tools and Applications*, 80(14), 21453-21487. https://doi.org/10.1007/s11042-021-10544-5
5. Wang, L., Zhang, J., & Liu, H. (2022). Automated maize seed defect detection using multi-pathway convolutional neural networks and watershed segmentation. *Biosystems Engineering*, 218, 45-58. https://doi.org/10.1016/j.biosystemseng.2022.03.011
6. World Development. (2020). Information and communication technologies to provide agricultural advice to smallholder farmers: Experimental evidence. *World Development*, 129, 104888. https://doi.org/10.1016/j.worlddev.2020.104888
7. Rwanda Agriculture and Animal Resources Development Board (RAB). (2024). *Seed Quality and On-Farm Testing Standards for Staples in Rwanda*. Ministry of Agriculture and Animal Resources (MINAGRI), Kigali, Rwanda.