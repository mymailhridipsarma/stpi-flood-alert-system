import serial
import time
import sys

try:
    ser = serial.Serial('/dev/cu.usbserial-0001', 115200, timeout=1)
    t_end = time.time() + 8
    print("Reading serial...")
    while time.time() < t_end:
        line = ser.readline()
        if line:
            print(line.decode('utf-8', errors='replace').strip())
    ser.close()
    print("Done")
except Exception as e:
    print(f"Error: {e}")
