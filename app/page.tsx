"use client"
import { useEffect, useState } from "react";
// dbounce from lodash
import { debounce, get } from "lodash";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export default function Home() {


  const [tasks, setTasks] = useState<Task[]>([]);


  
  useEffect(() => {
    getTasks()
  }, []);

  function getTasks(){
    fetch('/api/tasks')
      .then(response => response.json())
      .then(data => setTasks(data));
  }


  /*
  *
  *  Fetch all tasks from the server and set the state
  * 
  */
  async function addNewTask() {
    // Fetch all tasks from the server
    const response = await fetch('/api/tasks/new', {
      method: 'POST',
      body: JSON.stringify({
        title: prompt('Enter Title'),
        description: prompt('Enter Description'),
        status: "open"
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const newTask = await response.json();
    setTasks([...tasks, newTask]);
  }

  /*

  *  Mark a task as done
  * 
  */

  async function markDone(task: Task) {
    // Update the task on the server
    const response = await fetch(`/api/tasks/${task._id}/done`, {
      method: 'PUT'
    });

    task.status = "done";

    setTasks(tasks.map(currTask => task._id === currTask._id ? task : currTask));
  }

  async function searchTasks(event: any) {
    // Fetch all tasks from the server
    if (event.target.value !== "") {

    const response = await fetch(`/api/search/tasks?search=${event.target.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const newTasks = await response.json();
    setTasks(newTasks);
  } else {
    getTasks();
  }
  

  }
  const debouncedSearchTasks = debounce(searchTasks, 600);
  return (
    <main className="flex min-h-screen flex-col items-center  p-24">
      <h1 className="text-4xl font-bold">Task List</h1>
      <hr className="w-1/2 my-4" />
        <button className="px-4 py-2 bg-green-500 hover:bg-green-700  rounded-lg mb-4" onClick={addNewTask}>Add Task</button>

    <input type="text" id="search" name="search" placeholder="Search for tasks" className="w-1/2 p-2 mb-4 text-black" onChange={debouncedSearchTasks} />
    <div className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-sm">
        
        {tasks.map((task) => (
          <div key={task._id} className="flex flex-col  justify-between p-4 bg-white text-black shadow-lg rounded-lg ">
            <div className="flex task-head">
              <div className="ml-4">
                <div className=" justify-between flex mb-4 " > 
                {/* Delete X button */}
                <button className="px-2 py-1 bg-red-500 hover:bg-red-700 rounded-lg pd-0" onClick={async () => {
                  const response = await fetch(`/api/tasks/${task._id}`, {
                    method: 'DELETE'
                  });
                  setTasks(tasks.filter(currTask => currTask._id !== task._id));
                }}>X</button>
                <h2 className="text-xl font-bold mb-4">{task.title}</h2>
                </div>
                <p>{task.description}</p>
                <p>Status : {task.status}</p>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-700  rounded-lg mt-4" onClick={async () => {markDone(task)}}>Mark Done</button>
              </div>
            </div>
         </div>
        ))}
        
      </div>
    </main>
  );
}
