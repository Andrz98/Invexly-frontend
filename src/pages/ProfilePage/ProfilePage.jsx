import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react' // Importar los íconos para mostrar/ocultar contraseñas
import useAuth from '@/context/AuthContext/useAuth'
import api from '@/services/api/api'
import { UserRound, Upload, Camera, CheckCircle, XCircle } from 'lucide-react'
import Button from '@/Components/atoms/Button'
import Input from '@/Components/atoms/Input'
import AvatarSelector from '@/Components/molecules/AvatarSelector/AvatarSelector'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { user, login } = useAuth()
  const fileRef = useRef(null)
  const navigate = useNavigate()

  // Estado para manejar el formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    profileImage: null,
  })

  // Estado para los errores, loading, mensaje de éxito y visibilidad de contraseñas
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [changePassword, setChangePassword] = useState(false) // Controla si el usuario quiere cambiar su contraseña
  const [showPassword, setShowPassword] = useState(false) // Estado para controlar la visibilidad de las contraseñas
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [previewImage, setPreviewImage] = useState(user?.profileImage || null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // ================================
  // Función para mostrar mensaje de éxito
  // ================================
  const showSuccessMessage = (message) => {
    setErrors({}) // Limpiar errores previos

    toast.success(message, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })
  }

  // ================================
  // Manejo de Inputs
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target

    // Verificar si el campo modificado es `username` y capitalizarlo correctamente
    const formattedValue =
      name === 'username'
        ? value.charAt(0).toUpperCase() + value.slice(1) // Capitalizar primera letra
        : value

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  // ================================
  // Manejo de Subida de Imagenes
  // ================================
  const handleSaveChanges = async (e) => {
    e.preventDefault()
    const { profileImage, ...dataWithoutImage } = formData // Eliminar la imagen antes de enviar los datos
    await updateProfile(dataWithoutImage) // Llamamos `updateProfile` sin `profileImage`
  }

  // ================================
  // Alternar visibilidad de las contraseñas
  // ================================
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev) // Alternar la visibilidad
  }
  // ================================
  // Alternar cambio de contraseña
  // ================================
  const toggleChangePassword = () => {
    setChangePassword((prev) => !prev)
  }

  // ================================
  // Validar nueva contraseña antes de enviarla
  // ================================
  const validatePasswords = () => {
    // Validar si las contraseñas coinciden
    if (
      formData.newPassword && // Verificamos si hay una nueva contraseña
      formData.newPassword !== formData.confirmNewPassword // Comparamos si la nueva contraseña es diferente de la confirmación
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmNewPassword: 'Las contraseñas no coinciden', // Error si no coinciden
      }))
      return false
    }

    // Validar que la nueva contraseña no sea la misma que la actual
    if (formData.currentPassword === formData.newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: 'La nueva contraseña no puede ser la misma que la actual.', // Error si la nueva es igual a la actual
      }))
      return false
    }

    // Validaciones pasadas, devuelve true
    return true
  }

  // ================================
  // Subir imagen de perfil a Cloudinary y actualizar AuthContext
  // ================================
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataImage = new FormData()
    formDataImage.append('file', file) // Clave esperada por Cloudinary
    formDataImage.append('upload_preset', 'user_profile') // Configuración de Cloudinary
    formDataImage.append('cloud_name', 'dxdvc7uoe') // Configuración de Cloudinary

    setLoading(true)
    try {
      // Subir la imagen a Cloudinary
      const response = await api.post(
        'https://api.cloudinary.com/v1_1/dxdvc7uoe/image/upload',
        formDataImage,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: false,
          timeout: 30000,
        }
      )

      const updatedImage = response.data.secure_url
      if (!updatedImage)
        throw new Error('No se pudo obtener la URL de la imagen.')

      // Envia la URL de la imagen al backend para actualizarla
      const updatedUserResponse = await api.put('/auth/profile/avatar', {
        profileImage: updatedImage,
      })

      // Con los cambios realizados en AuthProvider.jsx ahora usamos `login()` para actualizar el estado global del usuario
      login(updatedUserResponse.data.updatedUser)

      setPreviewImage(updatedImage) // Sigue actualizando la previsualización de la imagen

      toast.success('Imagen de perfil actualizada con éxito.')

      return updatedImage
    } catch (error) {
      console.error('Error en handleImageChange:', error)
      setErrors({ api: error.message || 'Error al actualizar la imagen.' })
      return null
    } finally {
      setLoading(false)
    }
  }
  // ================================
  // Actualizar perfil en Backend (Perfil Completo)
  // ================================
  const updateProfile = async (data) => {
    setLoading(true)

    try {
      if (data.newPassword && !validatePasswords()) return

      const updatedUserData = { ...user }

      if (data.username) {
        await api.put('/auth/profile/username', { username: data.username })
        updatedUserData.username = data.username
      }

      if (data.email) {
        await api.put('/auth/profile/email', { email: data.email })
        updatedUserData.email = data.email
      }

      if (data.newPassword) {
        await api.put('/auth/profile/password', {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        })
      }

      if (data.profileImage instanceof File) {
        const updatedImage = await handleImageChange({
          target: { files: [data.profileImage] },
        })
        if (updatedImage) {
          updatedUserData.profileImage = updatedImage
        }
      } else if (typeof data.profileImage === 'string') {
        const updatedUserResponse = await api.put('/auth/profile/avatar', {
          profileImage: data.profileImage,
        })
        Object.assign(updatedUserData, updatedUserResponse.data.updatedUser)
      }

      // Actualiza el contexto global y el formulario
      login(updatedUserData)

      setFormData((prev) => ({
        ...prev,
        username: updatedUserData.username,
        email: updatedUserData.email,
        profileImage: updatedUserData.profileImage || null,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }))

      showSuccessMessage('Perfil actualizado correctamente.')
    } catch (error) {
      console.error('Error en updateProfile:', error)
      setErrors({ api: error.message || 'Error al actualizar perfil.' })
    } finally {
      setLoading(false)
    }
  }

  // ================================
  // Sincronizar previewImage con el estado global del usuario
  // ================================
  useEffect(() => {
    setPreviewImage(user?.profileImage ?? null) // Usamos `??` para asegurar que el valor sea `null` en lugar de `undefined`
  }, [user?.profileImage])

  // ================================
  // Sincronizar formData con el estado global del usuario
  // ================================
  // pages/ProfilePage/ProfilePage.jsx
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        profileImage: user.profileImage || null,
      })
      setPreviewImage(user.profileImage || null)
      setIsLoadingProfile(false)
    }
  }, [user])

  if (isLoadingProfile) {
    return <div className="text-center mt-10">Cargando perfil...</div>
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-[68px] px-4 bg-primary-light mb-20">
      <h2 className="text-4xl font-semibold text-primary-dark mb-8 tracking-wide animate-fade-in">
        Editar Perfil
      </h2>

      {/* Imagen de perfil */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-secondary-dark shadow-lg overflow-hidden transition-all duration-300 hover:scale-105">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound className="w-full h-full text-secondary-dark p-6" />
          )}
        </div>
      </div>

      {/* Botones de selección de imagen */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button
          variant="primary"
          type="button"
          onClick={() => fileRef.current.click()}
        >
          <Upload className="w-5 h-5 mr-2" />
          Subir Foto
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <Button
          variant="primary"
          type="button"
          onClick={() => setShowAvatarSelector(true)}
        >
          <Camera className="w-5 h-5 mr-2" />
          Elegir Avatar
        </Button>
      </div>

      {/* Formulario */}
      <form className="w-full max-w-[500px] mt-8 p-6 bg-primary-dark/70 backdrop-blur-xl shadow-2xl rounded-xl border border-secondary-dark space-y-5 animate-slide-up">
        <Input
          label="Nombre de Usuario"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        <Input
          label="Correo Electrónico"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Checkbox para cambiar contraseña */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={changePassword}
            onChange={toggleChangePassword}
            id="changePassword"
          />
          <label
            htmlFor="changePassword"
            className="text-primary-light text-sm cursor-pointer m-5"
          >
            ¿Cambiar Contraseña?
          </label>
        </div>

        {/* Campos de contraseña */}
        {changePassword && (
          <>
            <Input
              label="Contraseña Actual"
              name="currentPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <Input
              label="Nueva Contraseña"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
            />
            <Input
              label="Confirmar Nueva Contraseña"
              name="confirmNewPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmNewPassword}
              onChange={handleChange}
            />

            {/* Botón de mostrar/ocultar contraseñas */}
            <Button type="button" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          {/* Boton de Ir al Dashboard */}
          <Button
            variant="primary"
            type="button"
            onClick={() => navigate('/dashboard')} // Redirigir al Dashboard
          >
            <XCircle className="w-5 h-5 mr-2" />
            Ir al Inicio
          </Button>

          {/* Boton de Guardar cambios */}
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            onClick={handleSaveChanges}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>

      {/* AvatarSelector */}
      {showAvatarSelector && (
        <AvatarSelector
          onSaveAvatar={(avatarUrl) =>
            updateProfile({ profileImage: avatarUrl })
          }
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  )
}

export default ProfilePage
