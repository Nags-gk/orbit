import sqlite3

def run_migration():
    conn = sqlite3.connect("orbit.db")
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE transactions ADD COLUMN account_id VARCHAR(36) REFERENCES accounts(id) ON DELETE SET NULL;")
        print("Success: Added account_id to transactions table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column already exists")
        else:
            print(f"Error: {e}")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    run_migration()
