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
cat <<'ENDFILE' >> $NODE_HOME/tx-submit-api.sh
/$NODE_HOME/tx-submit-api -config /$NODE_HOME/config.yaml
ENDFILE
```

## Step 2 - Make Startup Script Executable
Make the script executable. Edit path if necessary.

```
chmod +x $NODE_HOME/tx-submit-api.sh
```

## Step 3 - Create Service file
