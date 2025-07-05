import { useEffect, useState } from 'react'

function App() {
  const [projects, setProjects] = useState([])
  const [experience, setExperience] = useState([])
  const [projectForm, setProjectForm] = useState({ title: '', description: '', link: '', image: '' })
  const [experienceForm, setExperienceForm] = useState({ 
    position: '', 
    company: '', 
    description: '', 
    start_date: '', 
    end_date: '' 
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProject, setEditingProject] = useState(null)
  const [editingExperience, setEditingExperience] = useState(null)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, experienceRes] = await Promise.all([
        fetch('http://localhost:8000/api/projects/'),
        fetch('http://localhost:8000/api/experience/')
      ])
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
      }
      
      if (experienceRes.ok) {
        const experienceData = await experienceRes.json()
        setExperience(experienceData)
      }
    } catch (err) {
      setError('Error al cargar los datos')
    }
  }

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  // Handle project form input
  const handleProjectChange = e => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value })
  }

  // Handle experience form input
  const handleExperienceChange = e => {
    setExperienceForm({ ...experienceForm, [e.target.name]: e.target.value })
  }

  // Handle file change
  const handleFileChange = e => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo debe ser menor a 5MB')
        return
      }
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen')
        return
      }
      setFile(selectedFile)
    }
  }

  // Validate URL
  const isValidUrl = (url) => {
    if (!url) return true // Optional field
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Add or update project
  const handleProjectSubmit = async e => {
    e.preventDefault()
    
    // Validation
    if (!projectForm.title.trim()) {
      setError('El título es obligatorio')
      return
    }
    
    if (!projectForm.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }
    
    if (projectForm.link && !isValidUrl(projectForm.link)) {
      setError('El enlace debe ser una URL válida')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('title', projectForm.title.trim())
      formData.append('description', projectForm.description.trim())
      formData.append('link', projectForm.link.trim())
      if (file) formData.append('image', file)
      
      const url = editingProject 
        ? `http://localhost:8000/api/projects/${editingProject.id}/`
        : 'http://localhost:8000/api/projects/'
      
      const method = editingProject ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        body: formData
      })
      
      if (!res.ok) throw new Error('Error al procesar proyecto')
      
      const projectData = await res.json()
      
      if (editingProject) {
        setProjects(projects.map(p => p.id === editingProject.id ? projectData : p))
        setSuccess('Proyecto actualizado correctamente')
        setEditingProject(null)
      } else {
        setProjects([projectData, ...projects])
        setSuccess('Proyecto agregado correctamente')
      }
      
      setProjectForm({ title: '', description: '', link: '', image: '' })
      setFile(null)
      
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Add or update experience
  const handleExperienceSubmit = async e => {
    e.preventDefault()
    
    // Validation
    if (!experienceForm.position.trim()) {
      setError('La posición es obligatoria')
      return
    }
    
    if (!experienceForm.company.trim()) {
      setError('La empresa es obligatoria')
      return
    }
    
    if (!experienceForm.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }
    
    if (!experienceForm.start_date) {
      setError('La fecha de inicio es obligatoria')
      return
    }
    
    // Validate date logic
    if (experienceForm.end_date && experienceForm.start_date > experienceForm.end_date) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const url = editingExperience 
        ? `http://localhost:8000/api/experience/${editingExperience.id}/`
        : 'http://localhost:8000/api/experience/'
      
      const method = editingExperience ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          position: experienceForm.position.trim(),
          company: experienceForm.company.trim(),
          description: experienceForm.description.trim(),
          start_date: experienceForm.start_date,
          end_date: experienceForm.end_date || null
        })
      })
      
      if (!res.ok) throw new Error('Error al procesar experiencia')
      
      const experienceData = await res.json()
      
      if (editingExperience) {
        setExperience(experience.map(e => e.id === editingExperience.id ? experienceData : e))
        setSuccess('Experiencia actualizada correctamente')
        setEditingExperience(null)
      } else {
        setExperience([experienceData, ...experience])
        setSuccess('Experiencia agregada correctamente')
      }
      
      setExperienceForm({ position: '', company: '', description: '', start_date: '', end_date: '' })
      
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Edit project
  const handleEditProject = (project) => {
    setProjectForm({
      title: project.title,
      description: project.description,
      link: project.link || '',
      image: project.image || ''
    })
    setEditingProject(project)
    setActiveTab('add')
  }

  // Edit experience
  const handleEditExperience = (exp) => {
    setExperienceForm({
      position: exp.position,
      company: exp.company,
      description: exp.description,
      start_date: exp.start_date,
      end_date: exp.end_date || ''
    })
    setEditingExperience(exp)
    setActiveTab('add')
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingProject(null)
    setEditingExperience(null)
    setProjectForm({ title: '', description: '', link: '', image: '' })
    setExperienceForm({ position: '', company: '', description: '', start_date: '', end_date: '' })
    setFile(null)
  }

  // Delete project
  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return
    
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${id}/`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Error al eliminar proyecto')
      setProjects(projects.filter(project => project.id !== id))
      setSuccess('Proyecto eliminado correctamente')
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete experience
  const handleDeleteExperience = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta experiencia?')) return
    
    try {
      const res = await fetch(`http://localhost:8000/api/experience/${id}/`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Error al eliminar experiencia')
      setExperience(experience.filter(exp => exp.id !== id))
      setSuccess('Experiencia eliminada correctamente')
    } catch (err) {
      setError(err.message)
    }
  }

  // Filter projects and experience based on search
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExperience = experience.filter(exp =>
    exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl font-bold tracking-wide text-white">CLEIDER PEREZ</h1>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'add' 
                    ? 'bg-white text-zinc-900' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                AGREGAR
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'projects' 
                    ? 'bg-white text-zinc-900' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                PROYECTOS ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'experience' 
                    ? 'bg-white text-zinc-900' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                EXPERIENCIA ({experience.length})
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {(error || success) && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-2 shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg mb-2 shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            </div>
          )}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Add/Edit Forms */}
        {activeTab === 'add' && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Form */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                    {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                  </h2>
                  {(editingProject || editingExperience) && (
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      name="title"
                      value={projectForm.title}
                      onChange={handleProjectChange}
                      placeholder="Título del proyecto *"
                      className="bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                      required
                    />
                    <input
                      name="link"
                      value={projectForm.link}
                      onChange={handleProjectChange}
                      placeholder="Enlace (https://ejemplo.com)"
                      className="bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Imagen del proyecto
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 transition-colors"
                    />
                    <p className="text-xs text-gray-500">Máximo 5MB. Formatos: JPG, PNG, GIF</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectChange}
                      placeholder="Describe tu proyecto detalladamente..."
                      rows="4"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors resize-none"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-white text-zinc-900 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'PROCESANDO...' : (editingProject ? 'ACTUALIZAR PROYECTO' : 'AGREGAR PROYECTO')}
                  </button>
                </form>
              </div>

              {/* Experience Form */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                    {editingExperience ? 'Editar Experiencia' : 'Nueva Experiencia'}
                  </h2>
                </div>
                
                <form onSubmit={handleExperienceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      name="position"
                      value={experienceForm.position}
                      onChange={handleExperienceChange}
                      placeholder="Posición/Cargo *"
                      className="bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                      required
                    />
                    <input
                      name="company"
                      value={experienceForm.company}
                      onChange={handleExperienceChange}
                      placeholder="Empresa *"
                      className="bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Fecha de inicio *
                      </label>
                      <input
                        name="start_date"
                        value={experienceForm.start_date}
                        onChange={handleExperienceChange}
                        type="date"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Fecha de fin
                      </label>
                      <input
                        name="end_date"
                        value={experienceForm.end_date}
                        onChange={handleExperienceChange}
                        type="date"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={experienceForm.description}
                      onChange={handleExperienceChange}
                      placeholder="Describe tus responsabilidades y logros..."
                      rows="4"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors resize-none"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-white text-zinc-900 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'PROCESANDO...' : (editingExperience ? 'ACTUALIZAR EXPERIENCIA' : 'AGREGAR EXPERIENCIA')}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {activeTab === 'projects' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                Proyectos
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 w-full sm:w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos todavía'}
                </div>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-white text-zinc-900 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
                >
                  Agregar Primer Proyecto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all duration-300 group hover:shadow-lg">
                    {project.image && (
                      <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                            title="Editar proyecto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                            title="Eliminar proyecto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-white flex-1">
                          {project.title}
                        </h3>
                        {!project.image && (
                          <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditProject(project)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                              title="Editar proyecto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                              title="Eliminar proyecto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      {project.link && (
                        <a 
                          href={project.link} 
                          className="inline-flex items-center text-white hover:text-gray-300 transition-colors font-medium"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <span>Ver proyecto</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Experience Section */}
        {activeTab === 'experience' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                Experiencia
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar experiencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 w-full sm:w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {filteredExperience.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  {searchTerm ? 'No se encontraron experiencias' : 'No hay experiencias todavía'}
                </div>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-white text-zinc-900 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
                >
                  Agregar Primera Experiencia
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExperience.map(exp => (
                  <div key={exp.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all duration-300 group hover:shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {exp.position}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-gray-400 font-medium">
                            {exp.company}
                          </div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full" />
                          <div className="text-sm text-gray-500">
                            {new Date(exp.start_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })} - {
                              exp.end_date 
                                ? new Date(exp.end_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
                                : 'Actualidad'
                            }
                          </div>
                        </div>
                        
                        {/* Duration calculation */}
                        <div className="text-xs text-gray-500 mb-3">
                          {(() => {
                            const start = new Date(exp.start_date)
                            const end = exp.end_date ? new Date(exp.end_date) : new Date()
                            const diffTime = Math.abs(end - start)
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            const years = Math.floor(diffDays / 365)
                            const months = Math.floor((diffDays % 365) / 30)
                            
                            if (years > 0) {
                              return `${years} año${years > 1 ? 's' : ''}${months > 0 ? ` y ${months} mes${months > 1 ? 'es' : ''}` : ''}`
                            } else if (months > 0) {
                              return `${months} mes${months > 1 ? 'es' : ''}`
                            } else {
                              return 'Menos de 1 mes'
                            }
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 lg:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditExperience(exp)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                          title="Editar experiencia"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                          title="Eliminar experiencia"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${exp.end_date ? 'bg-gray-500' : 'bg-green-500'}`} />
                      <span className={`text-xs font-medium ${exp.end_date ? 'text-gray-500' : 'text-green-400'}`}>
                        {exp.end_date ? 'Experiencia pasada' : 'Trabajo actual'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Stats Section */}
        <section className="mt-16 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
            Estadísticas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {projects.length}
              </div>
              <div className="text-sm text-gray-400">
                Proyectos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {experience.length}
              </div>
              <div className="text-sm text-gray-400">
                Experiencias
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {experience.filter(exp => !exp.end_date).length}
              </div>
              <div className="text-sm text-gray-400">
                Trabajos actuales
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {(() => {
                  const totalDays = experience.reduce((acc, exp) => {
                    const start = new Date(exp.start_date)
                    const end = exp.end_date ? new Date(exp.end_date) : new Date()
                    const diffTime = Math.abs(end - start)
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return acc + diffDays
                  }, 0)
                  return Math.floor(totalDays / 365)
                })()}
              </div>
              <div className="text-sm text-gray-400">
                Años de experiencia
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2024 Cleider Perez. Todos los derechos reservados.</p>
            <p className="text-sm">
              Portfolio construido con React • Diseño minimalista y funcional
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App