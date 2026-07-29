class MockData:
    def __init__(self, data):
        self.data = data

class MockQuery:
    def __init__(self, table_name, db):
        self.table_name = table_name
        self.db = db
        self.data = list(db.get(table_name, []))
        self.action = "select"
        self.update_data = None
        self.insert_data = None
        
    def select(self, cols):
        self.action = "select"
        return self
        
    def eq(self, col, val):
        self.data = [d for d in self.data if d.get(col) == val]
        return self
        
    def order(self, col, desc=False):
        self.data = sorted(self.data, key=lambda x: x.get(col, ""), reverse=desc)
        return self
        
    def limit(self, num):
        self.data = self.data[:num]
        return self
        
    def insert(self, record):
        self.action = "insert"
        self.insert_data = record
        return self

    def update(self, record):
        self.action = "update"
        self.update_data = record
        return self

    def execute(self):
        import uuid
        from datetime import datetime
        
        if self.action == "insert":
            if "id" not in self.insert_data:
                self.insert_data["id"] = str(uuid.uuid4())
            if "created_at" not in self.insert_data:
                self.insert_data["created_at"] = datetime.utcnow().isoformat() + "Z"
            if "recorded_at" not in self.insert_data:
                self.insert_data["recorded_at"] = datetime.utcnow().isoformat() + "Z"
            if self.table_name == "alerts" and "resolved" not in self.insert_data:
                self.insert_data["resolved"] = False
            
            self.db.setdefault(self.table_name, []).append(self.insert_data)
            return MockData([self.insert_data])
            
        elif self.action == "update":
            # intercept now()
            for k, v in self.update_data.items():
                if v == "now()":
                    self.update_data[k] = datetime.utcnow().isoformat() + "Z"
            for d in self.data:
                d.update(self.update_data)
            return MockData(self.data)
            
        else:
            return MockData(self.data)

class MockStorageFrom:
    def upload(self, path, file, file_options=None):
        pass
    def get_public_url(self, filename):
        return f"http://localhost:8000/images/{filename}"

class MockStorage:
    def from_(self, bucket):
        return MockStorageFrom()

class MockSupabase:
    def __init__(self):
        self.db = {
            "devices": [
                {
                    "device_id": "DEV-ESP32-MAIN-001",
                    "name": "Local Test Device",
                    "status": "ONLINE",
                    "last_latitude": 37.7749,
                    "last_longitude": -122.4194,
                    "last_seen": "2026-07-15T00:00:00Z",
                    "created_at": "2026-07-15T00:00:00Z"
                }
            ],
            "status_logs": [],
            "alerts": [],
            "object_detections": []
        }
        self.storage = MockStorage()

    def table(self, name):
        return MockQuery(name, self.db)

supabase_client = MockSupabase()
