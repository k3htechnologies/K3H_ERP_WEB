export const handleExportFile = (
  response: any,
  exportType: 'Excel' | 'PDF' | 'Image' | 'Word' | 'Other',
  fileName: string,
  addToast: (options: { type: 'success' | 'error'; title: string }) => void,
  message?: string
) => {

  const data = response?.right?.Data;

  const isEmpty = !data || (Array.isArray(data) && data.length === 0) || (typeof data === 'string' && data.trim() === '');

  if (!isEmpty) {
    handleBase64Export(data, exportType, fileName, addToast, message);
  }
  else {
    addToast({ type: 'error', title: 'No data available for export' });
  }

};

export const handleBase64Export = (
  fileData: any,
  exportType: 'Excel' | 'PDF' | 'Image' | 'Word' | 'Other',
  fileName: string,
  addToast: (options: { type: 'success' | 'error'; title: string }) => void,
  message?: string,
) => {
  try {
    // Extract base64 data from response

    const base64Data = Array.isArray(fileData)
      ? fileData[0]
      : fileData?.Base64 || fileData;

    if (!base64Data) {
      addToast({ type: 'error', title: 'No data available for export' })
      return
    }

    const mimeType =
      fileData?.ContentType ||
      (
        exportType === 'Excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : exportType === 'PDF'
            ? 'application/pdf'
            : exportType === 'Image'
              ? 'image/png'
              : exportType === 'Word'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/octet-stream'
      );

    const binaryString = atob(base64Data)

    const bytes = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Create blob from decoded bytes
    const blob = new Blob([bytes], { type: mimeType })

    // Create download URL
    const url = window.URL.createObjectURL(blob)

    // Create download link
    const link = document.createElement('a')
    link.href = url

    // Generate timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

    // Set filename with timestamp
    const fileExtension =
      fileData?.FileName?.split('.').pop() ||
      (exportType === 'Excel'
        ? 'xlsx'
        : exportType === 'PDF'
          ? 'pdf'
          : exportType === 'Image'
            ? 'png'
            : exportType === 'Word'
              ? 'docx'
              : 'bin');

    link.download =
      fileData?.FileName ||
      `${fileName} ${timestamp}.${fileExtension}`;

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up URL
    window.URL.revokeObjectURL(url)

    // Show success message
    addToast({ type: 'success', title: message ?? `Successfully Exported as ${exportType}` })

  } catch (error: any) {
    console.error('Export error:', error)
    addToast({ type: 'error', title: error.message || 'Export failed' })
  }
}