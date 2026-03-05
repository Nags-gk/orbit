#!/bin/bash
echo "Setting up GitHub Authentication..."
echo "Please enter your GitHub Personal Access Token (PAT)."
echo "You can generate one at: https://github.com/settings/tokens"
read -s -p "Token: " TOKEN
echo ""
git remote set-url origin https://Nags-gk:$TOKEN@github.com/Nags-gk/orbit.git
echo "Pushing code to GitHub..."
git push -u origin main --force
echo "Done! If successful, the code is now live on GitHub."
