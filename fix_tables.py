import re

with open("SeedSec_Rwanda_Proposal.md", "r") as f:
    content = f.read()

table1_new = """| Item Category | Item Description | Estimated Cost (RWF) | Estimated Cost (USD) | Source / Justification |
| --- | --- | --- | --- | --- |
| **Computing & Cloud** | Google Colab Pro GPU instances (2 months) | 26,000 RWF | $20.00 USD | Accelerated model training |
| **Edge Hardware** | Testing mobile handsets (used Android devices) | 120,000 RWF | $92.00 USD | Deploying and measuring offline TFLite runs |
| **Data & Storage** | Mobile data bundles for dataset synchronization | 50,000 RWF | $38.00 USD | Transferring model weights |
| **Reporting** | Printing and academic thesis compilation | 65,000 RWF | $50.00 USD | Archive copy compilation |
| **Total Budget** | | **261,000 RWF** | **$200.00 USD** | Funded by the student researcher |"""

table2_new = """| Phase | Activities | Month 1 | Month 2 | Month 3 | Month 4 | Month 5 |
| --- | --- | --- | --- | --- | --- | --- |
| **Phase 1: Modeling** | Literature review, model training on Kaggle datasets | **[X]** | | | | |
| **Phase 2: Model Compression** | Model optimization (quantization, conversion to TFLite) | | **[X]** | | | |
| **Phase 3: Web App** | FastAPI backend & Next.js frontend implementation | | | **[X]** | | |
| **Phase 4: Mobile App** | Mobile integration, local TFLite offline interpreter | | | | **[X]** | |
| **Phase 5: Comparative Evaluation** | Comparative evaluation (cloud vs. offline edge) & report | | | | | **[X]** |"""

table3_new = """| Study Citation | Focus Area | Methodology | Key Findings | Strengths | Weaknesses |
| --- | --- | --- | --- | --- | --- |
| **Chen et al. (2024)** | Maize seed germination and vigor detection | Constructed 19,800 RGB images annotated in 5 germination classes | Developed baseline models for prediction of primary/secondary roots. | Large, high-resolution dataset with dense bounding box annotations. | Does not optimize models for low-power edge device deployment. |
| **Li et al. (2023)** | Lightweight maize seed classification | MobileNetV3 integrated with CBAM attention module | Achieved 93.14% classification accuracy across broken, moldy, and damaged seeds. | Highly optimized model size suitable for mobile integration. | Did not test performance on multi-species or vegetable seeds. |
| **Wang et al. (2022)** | Automated seed variety classification | Multi-pathway CNN classifier trained on RGB variety images | Achieved >95% accuracy in distinguishing variety classes. | Excellent robustness under varied lighting conditions. | Requires high GPU capabilities for training and execution. |
| **Frontiers in Plant Science (2023)** | Deep learning for seed quality grading | CNN classifier evaluating seed vigor categories (High, Medium, Low) | Demonstrated strong correlation between surface texture features and vigor. | Validates RGB imaging as a low-cost vigor indicator. | High dependency on uniform backgrounds and alignment. |"""

table4_new = """| System | Primary Strengths | Primary Weaknesses | Gaps Addressed by SeedSec Rwanda |
| --- | --- | --- | --- |
| **ISTA Lab Testing** | Maximum scientific accuracy. | Slow (7-14 days), expensive, centralized. | Concept of a zero-cost, near-instant, mobile-ready diagnostic framework. |
| **Industrial Sorters** | High speed, multi-spectral detection of internal defects. | Prohibitively expensive hardware, not portable. | Focuses on RGB image datasets compatible with standard smartphone cameras. |
| **Manual Screening** | Zero financial cost, immediate field execution. | High subjectivity, low accuracy, cannot verify vigor. | Replaces subjective screening with objective, trained deep learning models. |"""

# Replacing table 1 (81 hyphens)
content = re.sub(r'  -{81}\n.*?  -{81}\n', table1_new + '\n', content, flags=re.DOTALL)
# Replacing table 2 (92 hyphens)
content = re.sub(r'  -{92}\n.*?  -{92}\n', table2_new + '\n', content, flags=re.DOTALL)
# Replacing table 3 (103 hyphens)
content = re.sub(r'  -{103}\n.*?  -{103}\n', table3_new + '\n', content, flags=re.DOTALL)
# Replacing table 4 (71 hyphens)
content = re.sub(r'  -{71}\n.*?  -{71}\n', table4_new + '\n', content, flags=re.DOTALL)

with open("SeedSec_Rwanda_Proposal.md", "w") as f:
    f.write(content)
