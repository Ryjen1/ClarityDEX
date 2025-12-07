# Clarinet Installation Guide for Windows

## Method 1: Using Cargo (Rust Package Manager) - Recommended

**Prerequisites:** Install Rust first
1. Go to https://rustup.rs/
2. Download and run the installer
3. Restart your terminal/command prompt

**Install Clarinet:**
```bash
cargo install clarinet
```

## Method 2: Using Pre-built Binary

1. **Download Clarinet:**
   - Go to https://github.com/hirosystems/clarinet/releases
   - Download the latest release for Windows
   - Look for `clarinet-x86_64-pc-windows-msvc.zip`

2. **Extract and Setup:**
   - Extract the ZIP file
   - Copy `clarinet.exe` to a folder (e.g., `C:\clarinet`)
   - Add `C:\clarinet` to your system PATH:
     - Right-click "This PC" → Properties → Advanced System Settings
     - Click "Environment Variables"
     - Under "System Variables", find "Path" and click "Edit"
     - Click "New" and add `C:\clarinet`
     - Click OK on all windows

3. **Verify Installation:**
   ```bash
   clarinet --version
   ```

## Method 3: Using Scoop (If you have it installed)

```bash
scoop install clarinet
```

## Method 4: Using Chocolatey (If you have it installed)

```bash
choco install clarinet
```

## After Installation

Once Clarinet is installed, navigate to your project directory:

```bash
cd c:/Users/HP/desktop/folder/stacks-decentralizedExchange
clarinet deploy --testnet
```

## Troubleshooting

**If "clarinet" command is not recognized:**
- Ensure the installation directory is in your PATH
- Restart your terminal/command prompt
- Try running as administrator

**If you get permission errors:**
- Run Command Prompt as Administrator
- Or install in your user directory instead of system-wide

**Verification:**
```bash
clarinet --help
```

This should show you all available Clarinet commands. Once you see this, you're ready to deploy to testnet!