import React, { useState, useEffect } from 'react'
import { formatDateString } from '../utils/dateUtils'
import './Tasks.css'

function Tasks({ selectedDate }) {
  const [tasks, setTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')

  useEffect(() => {
    // Load saved tasks for the selected date
    const key = `tasks2026`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const allTasks = JSON.parse(saved)
        setTasks(allTasks[selectedDate] || [])
      } catch (e) {
        console.error('Error loading tasks:', e)
      }
    }
  }, [selectedDate])

  const saveTasks = (updatedTasks) => {
    const key = `tasks2026`
    let allTasks = {}
    
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        allTasks = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Error loading tasks:', e)
    }

    allTasks[selectedDate] = updatedTasks
    localStorage.setItem(key, JSON.stringify(allTasks))
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (newTaskText.trim() === '') return

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
    setNewTaskText('')
  }

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const handleEditTask = (taskId, newText) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    )
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  return (
    <div className="tasks-card">
      <h2 className="tasks-title">
        Tasks for {formatDateString(selectedDate)}
      </h2>

      <form className="tasks-form" onSubmit={handleAddTask}>
        <input
          type="text"
          className="tasks-input"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTask(e)
            }
          }}
        />
        <button type="submit" className="tasks-add-btn">
          Add
        </button>
      </form>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p className="tasks-empty">No tasks yet. Add one above!</p>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))
        )}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  const handleEdit = () => {
    if (isEditing && editText.trim() !== '') {
      onEdit(task.id, editText.trim())
    }
    setIsEditing(!isEditing)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit()
    } else if (e.key === 'Escape') {
      setEditText(task.text)
      setIsEditing(false)
    }
  }

  return (
    <div className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      
      {isEditing ? (
        <input
          type="text"
          className="task-edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyPress}
          autoFocus
        />
      ) : (
        <span 
          className="task-text"
          onDoubleClick={handleEdit}
          title="Double-click to edit"
        >
          {task.text}
        </span>
      )}
      
      <button
        className="task-delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task "${task.text}"`}
      >
        ×
      </button>
    </div>
  )
}

export default Tasks

