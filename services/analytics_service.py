import pandas as pd
import numpy as np
from models import Task

def get_task_analytics(user_id):
    """
    Calculates task statistics for a specific user using Pandas and NumPy.
    
    Args:
        user_id (int): The ID of the user whose tasks to analyze.
        
    Returns:
        dict: A dictionary containing total tasks, completed tasks, 
              pending tasks, and completion percentage.
    """
    # Query all tasks for the user
    tasks = Task.query.filter_by(user_id=user_id).all()
    
    # Handle case with no tasks to avoid division by zero
    if not tasks:
        return {
            'total_tasks': 0,
            'completed_tasks': 0,
            'pending_tasks': 0,
            'completion_percentage': 0.0
        }
    
    # Create a Pandas DataFrame from the task objects
    # This demonstrates proficiency in converting ORM results to data science formats
    df = pd.DataFrame([task.to_dict() for task in tasks])
    
    # Use Pandas vector operations for calculations (more efficient than loops)
    total_tasks = len(df)
    completed_tasks = len(df[df['status'] == 'Completed'])
    pending_tasks = total_tasks - completed_tasks
    
    # Use NumPy for precision rounding and percentage calculation
    completion_percentage = np.round((completed_tasks / total_tasks) * 100, 2)
    
    return {
        'total_tasks': int(total_tasks),
        'completed_tasks': int(completed_tasks),
        'pending_tasks': int(pending_tasks),
        'completion_percentage': float(completion_percentage)
    }
