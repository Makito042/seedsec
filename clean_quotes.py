import os

filepath = "SeedSec_Rwanda_Proposal.md"
with open(filepath, "r") as f:
    lines = f.readlines()

with open(filepath, "w") as f:
    for line in lines:
        stripped = line.strip()
        # Remove lines that are exactly ">"
        if stripped == ">":
            continue
        # Also remove lines that are just "\>"
        if stripped == "\>":
            continue
            
        # Clean up escaped greater-than signs inside text (e.g., \>85%)
        line = line.replace("\\>", ">")
        
        f.write(line)
