#!/usr/bin/env python3
"""
Quick health check script for Veil backend
Tests if the API is running and the model is loaded
"""

import requests
import sys
from rich.console import Console
from rich.table import Table

console = Console()

API_URL = "http://localhost:8000"

def check_api_health():
    """Check if API is running and model is loaded"""
    
    console.print("\n[bold cyan]Veil Backend Health Check[/bold cyan]")
    console.print("=" * 50)
    
    try:
        # Check root endpoint
        console.print("\n[yellow]Checking API connection...[/yellow]")
        response = requests.get(f"{API_URL}/", timeout=5)
        
        if response.status_code == 200:
            console.print("✓ [green]API is running[/green]")
        else:
            console.print("✗ [red]API returned unexpected status[/red]")
            return False
            
    except requests.exceptions.ConnectionError:
        console.print("✗ [red]Cannot connect to API[/red]")
        console.print(f"  Make sure the backend is running at {API_URL}")
        console.print("  Run: cd backend && python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        console.print(f"✗ [red]Error: {e}[/red]")
        return False
    
    try:
        # Check health endpoint
        console.print("\n[yellow]Checking model status...[/yellow]")
        response = requests.get(f"{API_URL}/health", timeout=5)
        health_data = response.json()
        
        if health_data.get("model_loaded"):
            console.print("✓ [green]Model is loaded and ready[/green]")
        else:
            console.print("✗ [red]Model is not loaded[/red]")
            console.print("  Run: cd backend/ml && python train.py")
            return False
            
    except Exception as e:
        console.print(f"✗ [red]Health check failed: {e}[/red]")
        return False
    
    # Test prediction
    console.print("\n[yellow]Testing prediction endpoint...[/yellow]")
    try:
        test_email = "This is a test email"
        response = requests.post(
            f"{API_URL}/api/predict",
            json={"email_text": test_email},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            console.print("✓ [green]Prediction endpoint working[/green]")
            
            # Display test result
            table = Table(title="Test Prediction Result")
            table.add_column("Field", style="cyan")
            table.add_column("Value", style="green")
            
            table.add_row("Prediction", result["prediction"])
            table.add_row("Confidence", f"{result['confidence']:.4f}")
            table.add_row("Message", result["message"])
            
            console.print(table)
        else:
            console.print(f"✗ [red]Prediction failed with status {response.status_code}[/red]")
            return False
            
    except Exception as e:
        console.print(f"✗ [red]Prediction test failed: {e}[/red]")
        return False
    
    console.print("\n[bold green]✓ All checks passed![/bold green]")
    console.print("Your Veil backend is ready to use.\n")
    return True


if __name__ == "__main__":
    try:
        success = check_api_health()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        console.print("\n[yellow]Health check interrupted[/yellow]")
        sys.exit(1)
