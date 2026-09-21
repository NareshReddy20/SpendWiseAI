from core.security import hash_password
password = "naresh123"
hashed_password = hash_password(password)
print("Original password:", password)
print("Hashed password:", hashed_password)