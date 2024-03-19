from fastapi import FastAPI
from lib.db import get_mongo_client
from bson import ObjectId
from pymongo.operations import SearchIndexModel

app = FastAPI()

def set_search_atlas_index():

    try:
        client = get_mongo_client()
        tasks_collection = client.get_collection('tasks')
        search_index_model = SearchIndexModel(
            definition={
                "mappings": {
                    "dynamic": True
                },
            },
            name="default",
        )
        result = tasks_collection.create_search_index(model=search_index_model)
        print(result)
    except Exception as e:
        print(e)


set_search_atlas_index()

"""
This endpoint returns a list of tasks from the database.
"""
@app.get("/api/tasks")
async def get_tasks():
    client = get_mongo_client()
    tasks_collection = client.get_collection('tasks')
    tasks = list(tasks_collection.find({}).limit(25))
    for task in tasks:
        task["_id"] = str(task["_id"])
    return tasks

"""
This endpoint creates a new task in the database.
"""
@app.post("/api/tasks/new")
async def create_task(task: dict):
    client = get_mongo_client()
    tasks_collection = client.get_collection('tasks')
    result = tasks_collection.insert_one(task)
    task["_id"] = str(result.inserted_id)
    return task

"""
This endpoint marks a task as done in the database.
"""
@app.put("/api/tasks/{task_id}/done")
async def mark_task_done(task_id: str):
    client = get_mongo_client()
    tasks_collection = client.get_collection('tasks')
    result = tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": "done"}})
    return {"modified_count": result.modified_count}

"""
This endpoint deletes a task from the database.
"""
@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    client = get_mongo_client()
    tasks_collection = client.get_collection('tasks')
    result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
    return {"deleted_count": result.deleted_count}

@app.get("/api/search/tasks")
async def search_tasks(search: str):
    client = get_mongo_client()
    tasks_collection = client.get_collection('tasks')
    pipeline = [   
        {"$search":
            {   
                "index": "default",
                "regex":
                {
                    #"query": "*" + {search} + "*",
                    "query": f".*{search}.*",
                    "path": "title",
                    "allowAnalyzedField": True
                }
            }
        }]
    print(pipeline)
    tasks = list(tasks_collection.aggregate(pipeline))
    for task in tasks:
        task["_id"] = str(task["_id"])
    return tasks