import os

filepath = "SeedSec_Rwanda_Proposal.md"
with open(filepath, "r") as f:
    lines = f.readlines()

with open(filepath, "w") as f:
    for line in lines:
        # Remove trailing backslash before the newline
        if line.endswith("\\\n"):
            line = line[:-2] + "\n"
            
        # Replace \*\* with ** and \* with *
        line = line.replace("\\*\\*", "**")
        line = line.replace("\\*", "*")
        
        # There are some weird constructs like **\*\*Prepared By:**\*\*
        # The line above would become ******Prepared By:******
        # Let's clean up any excessive asterisks (more than 2) to just 2
        import re
        line = re.sub(r'\*{3,}', '**', line)
        
        f.write(line)
