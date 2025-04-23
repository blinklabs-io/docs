---
title: Creating Startup Scripts and Services Guide
description: Tx Submit API Creating Startup Scripts and Services Guide.
---

# Creating Startup Scripts and Services

overview text

## Step 1 - Create a Startup Script
Create a startup script and service file, be sure to edit your paths below. For this example we set all paths to `$NODE_HOME` folder.  

First Make startup script:

```
cat << EOF >> $NODE_HOME/tx-submit-api.sh
/$NODE_HOME/tx-submit-api -config /$NODE_HOME/config.yaml
EOF
```

## Step 2 - Make Startup Script Executable
Make the script executable. Edit path if necessary.

```
chmod +x $NODE_HOME/tx-submit-api.sh
```

## Step 3 - Create Service File
Next, we will write the tx-submit-api.service file, which will be run by systemd.

```
cat << EOF >> /tmp/tx-submit-api.service
[Unit]
Description=TX Submit API
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=${USER}
WorkingDirectory=/path/to/startup-script
ExecStart=/bin/bash -l -c "exec ./tx-submit-api.sh"
SuccessExitStatus=143
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tx-submit-api
TimeoutStopSec=2
KillMode=mixed

[Install]
WantedBy=multi-user.target
EOF
```
