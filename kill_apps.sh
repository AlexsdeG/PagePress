#!/bin/bash

# Define the ports your applications use
FRONTEND_PORT=5173
BACKEND_PORT=3000

echo "Attempting to stop processes on ports $FRONTEND_PORT and $BACKEND_PORT..."

# Function to kill processes on a specific port
kill_process_on_port() {
    PORT=$1
    echo "Checking port $PORT..."
    
    # Find PIDs of processes listening on the port.
    # We use 'lsof -t -i TCP:$PORT' for a cleaner output of PIDs only.
    PIDS=$(lsof -t -i TCP:$PORT)

    if [ -n "$PIDS" ]; then
        # Iterate over each PID found (handles multiple processes if necessary)
        for PID in $PIDS; do
            echo "Found process (PID $PID) running on port $PORT. Killing..."
            # Use 'kill -9' to forcefully terminate the process
            sudo kill -9 "$PID"
            echo "Process $PID terminated."
        done
    else
        echo "No process found running on port $PORT."
    fi
}

# Kill frontend
kill_process_on_port $FRONTEND_PORT

# Kill backend
kill_process_on_port $BACKEND_PORT

echo "Script finished."
