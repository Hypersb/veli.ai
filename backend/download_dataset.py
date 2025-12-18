"""
Quick script to download the SMS Spam Collection dataset
"""
import urllib.request
import os

def download_dataset():
    """Download SMS Spam Collection dataset from UCI repository"""
    
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(__file__), 'data', 'raw')
    os.makedirs(data_dir, exist_ok=True)
    
    # Dataset URL (UCI Machine Learning Repository)
    url = "https://raw.githubusercontent.com/mohitgupta-omg/Kaggle-SMS-Spam-Collection-Dataset-/master/spam.csv"
    output_path = os.path.join(data_dir, 'spam.csv')
    
    print("Downloading SMS Spam Collection dataset...")
    print(f"URL: {url}")
    print(f"Saving to: {output_path}")
    
    try:
        urllib.request.urlretrieve(url, output_path)
        print("\n✓ Dataset downloaded successfully!")
        print(f"✓ File location: {output_path}")
        
        # Check file size
        file_size = os.path.getsize(output_path)
        print(f"✓ File size: {file_size:,} bytes")
        
        return True
    except Exception as e:
        print(f"\n✗ Error downloading dataset: {e}")
        print("\nAlternative: Download manually from:")
        print("https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset")
        return False

if __name__ == "__main__":
    success = download_dataset()
    if not success:
        exit(1)
