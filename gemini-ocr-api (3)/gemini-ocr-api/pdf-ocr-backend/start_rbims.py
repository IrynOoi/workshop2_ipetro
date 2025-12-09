#!/usr/bin/env python3
"""
RBIMS System Startup Manager
This script starts both the Node.js backend server and Python monitoring service
"""

import subprocess
import sys
import os
import time
import signal
import select
from pathlib import Path

class RBIMSManager:
    def __init__(self):
        self.nodejs_process = None
        self.python_process = None
        self.running = True
        
    def start_nodejs_server(self):
        """Start the Node.js Express server"""
        print("🚀 Starting Node.js backend server...")
        try:
            self.nodejs_process = subprocess.Popen(
                ['node', 'server.js'],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,  # Merge stderr into stdout
                text=True,
                bufsize=1,
                encoding='utf-8',
                errors='replace'
            )
            print("✅ Node.js server started (PID: {})".format(self.nodejs_process.pid))
            return True
        except Exception as e:
            print(f"❌ Failed to start Node.js server: {e}")
            return False
    
    def start_python_service(self):
        """Start the Python monitoring/helper service"""
        print("🐍 Starting Python monitoring service...")
        try:
            self.python_process = subprocess.Popen(
                [sys.executable, 'rbims_monitor.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,  # Merge stderr into stdout
                text=True,
                bufsize=1,
                encoding='utf-8',
                errors='replace'
            )
            print("✅ Python service started (PID: {})".format(self.python_process.pid))
            return True
        except Exception as e:
            print(f"❌ Failed to start Python service: {e}")
            return False
    
    def read_process_output(self, process, name):
        """Non-blocking read from process stdout"""
        if process and process.stdout:
            # On Windows, we need to use a different approach
            # Try to read available lines without blocking
            try:
                # Check if process has output available
                line = process.stdout.readline()
                if line:
                    print(f"[{name}] {line.strip()}")
                    return True
            except Exception as e:
                print(f"Error reading from {name}: {e}")
        return False
    
    def monitor_processes(self):
        """Monitor both processes and restart if they crash"""
        print("\n📊 Monitoring system status... (Press Ctrl+C to stop)\n")
        
        restart_count = 0
        max_restarts = 5
        last_restart_time = time.time()
        
        while self.running:
            try:
                # Read output first (before checking if crashed)
                has_output = False
                
                # Read from Node.js
                if self.nodejs_process and self.nodejs_process.poll() is None:
                    has_output = self.read_process_output(self.nodejs_process, "Node.js") or has_output
                
                # Read from Python service
                if self.python_process and self.python_process.poll() is None:
                    has_output = self.read_process_output(self.python_process, "Python") or has_output
                
                # Check Node.js process status
                if self.nodejs_process:
                    exit_code = self.nodejs_process.poll()
                    if exit_code is not None:
                        # Process has exited - read any remaining output
                        remaining = self.nodejs_process.stdout.read()
                        if remaining:
                            for line in remaining.strip().split('\n'):
                                if line:
                                    print(f"[Node.js] {line}")
                        
                        print(f"⚠️  Node.js server exited with code {exit_code}")
                        
                        # Prevent restart loop
                        current_time = time.time()
                        if current_time - last_restart_time < 10:
                            restart_count += 1
                        else:
                            restart_count = 1
                        last_restart_time = current_time
                        
                        if restart_count >= max_restarts:
                            print(f"❌ Node.js server crashed {max_restarts} times in quick succession!")
                            print("❌ Please check your server.js for errors.")
                            print("\n💡 Try running 'node server.js' directly to see the full error.")
                            self.shutdown()
                            break
                        
                        print(f"🔄 Restarting... (attempt {restart_count}/{max_restarts})")
                        time.sleep(2)  # Wait before restart
                        self.start_nodejs_server()
                
                # Check Python process status
                if self.python_process:
                    exit_code = self.python_process.poll()
                    if exit_code is not None:
                        remaining = self.python_process.stdout.read()
                        if remaining:
                            for line in remaining.strip().split('\n'):
                                if line:
                                    print(f"[Python] {line}")
                        print(f"⚠️  Python service exited with code {exit_code}")
                        print("🔄 Restarting Python service...")
                        time.sleep(1)
                        self.start_python_service()
                
                # Small delay to prevent CPU spinning
                if not has_output:
                    time.sleep(0.1)
                
            except KeyboardInterrupt:
                print("\n\n🛑 Shutdown signal received...")
                self.shutdown()
                break
    
    def shutdown(self):
        """Gracefully shutdown all processes"""
        print("🔄 Shutting down RBIMS system...")
        self.running = False
        
        if self.nodejs_process and self.nodejs_process.poll() is None:
            print("⏹️  Stopping Node.js server...")
            self.nodejs_process.terminate()
            try:
                self.nodejs_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.nodejs_process.kill()
            print("✅ Node.js server stopped")
        
        if self.python_process and self.python_process.poll() is None:
            print("⏹️  Stopping Python service...")
            self.python_process.terminate()
            try:
                self.python_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.python_process.kill()
            print("✅ Python service stopped")
        
        print("👋 RBIMS system shutdown complete")
    
    def run(self):
        """Main entry point"""
        print("=" * 60)
        print("🏭 iPETRO RBIMS System Manager")
        print("=" * 60)
        print()
        
        # Check if required files exist
        if not Path('server.js').exists():
            print("❌ Error: server.js not found!")
            return
        
        # Start services
        if not self.start_nodejs_server():
            return
        
        time.sleep(2)  # Wait for Node.js to start
        
        if Path('rbims_monitor.py').exists():
            self.start_python_service()
        else:
            print("⚠️  rbims_monitor.py not found - skipping Python service")
        
        # Monitor processes
        self.monitor_processes()


def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    pass  # Let the KeyboardInterrupt handle it


if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    manager = RBIMSManager()
    manager.run()