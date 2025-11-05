/**
 * Format date string with time to "DD Month YYYY HH:MM AM/PM" format
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timeString - Time string in HH:MM format (optional)
 * @returns Formatted date and time string (e.g., "07 July 2025 2:30 PM")
 */
export const formatDate_dd_MonthName_yy_hh_mm = (dateString: string, timeString?: string): string => {
  if (!dateString || dateString.trim() === '') {
    return ''
  }

  try {
    let date: Date
    
    // If timeString is provided, combine date and time
    if (timeString && timeString.trim() !== '') {
      const combinedDateTime = `${dateString}T${timeString}`
      date = new Date(combinedDateTime)
    } else {
      date = new Date(dateString)
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }

    const day = date.getDate().toString().padStart(2, '0')
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    // Format time to 12-hour format with AM/PM
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    // Convert to 12-hour format
    hours = hours % 12
    hours = hours ? hours : 12 // 0 should be 12
    
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`

    return `${day} ${month} ${year} ${formattedTime}`
  } catch (error) {
    console.error('Error formatting date and time:', error)
    return ''
  }
}


/**
 * Format date string to "DD Month YYYY" format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "07 July 2025")
 */
export const formatDate_dd_MonthName_yy = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {
    return ''
  }

  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }

    const day = date.getDate().toString().padStart(2, '0')
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}