# Quick Clarinet Installation (Space-Efficient Method)

## 🎯 Best for Limited Space - Only ~15 MB needed!

### Step 1: Download Clarinet
1. Go to: https://github.com/hirosystems/clarinet/releases
2. Find the latest release
3. Download: `clarinet-x86_64-pc-windows-msvc.zip`
   - File size: ~10-15 MB

### Step 2: Extract
1. Right-click the downloaded ZIP file
2. Select "Extract All..."
3. Choose a temporary location (like Desktop)

### Step 3: Copy to npm Folder (Automatic PATH)
1. Navigate to the extracted folder
2. Find `clarinet.exe`
3. Copy `clarinet.exe` to: `C:\Users\HP\AppData\Local\npm\`

**Why this folder?** 
- Already in your system PATH
- No need to modify environment variables
- Works immediately after copying

### Step 4: Verify Installation
1. Open a **new** Command Prompt (important!)
2. Run: `clarinet --version`
3. You should see version information

### Step 5: Deploy Your ClarityDEX!
```bash
cd c:/Users/HP/desktop/folder/stacks-decentralizedExchange
clarinet deploy --testnet
```

## ✅ Success Indicators:
- `clarinet --version` shows version info
- No "command not found" errors
- Ready to deploy to testnet!

## 🔧 If It Doesn't Work:
1. Make sure you opened a **new** command prompt
2. Try copying to: `C:\Users\HP\AppData\Roaming\npm\`
3. Restart your computer if needed

**That's it! Your ClarityDEX project is ready for testnet deployment!**