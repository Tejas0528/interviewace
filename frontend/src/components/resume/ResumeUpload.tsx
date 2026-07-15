import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react'
import { useResume } from '@/hooks/useResume'

export default function ResumeUpload() {
  const { upload, isUploading } = useResume()
  const [file, setFile] = useState<File | null>(null)
  const [uploaded, setUploaded] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setUploaded(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  })

  const handleUpload = () => {
    if (!file) return
    upload(file, {
      onSuccess: () => {
        setUploaded(true)
        setFile(null)
      },
    })
  }

  return (
    <div className="glass-card">
      <h3 className="section-title">Upload Your Resume</h3>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-brand-500 bg-brand-500/5'
            : 'border-white/10 hover:border-white/25 hover:bg-white/2'
          }`}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center">
                <FileText className="w-7 h-7 text-brand-400" />
              </div>
              <div>
                <p className="text-slate-200 font-medium">{file.name}</p>
                <p className="text-slate-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="text-slate-600 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : uploaded ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              <p className="text-emerald-400 font-medium">Resume uploaded successfully!</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Upload className="w-7 h-7 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-300 font-medium">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                </p>
                <p className="text-slate-500 text-sm mt-1">PDF, DOC, DOCX supported</p>
              </div>
              <p className="text-xs text-slate-600">or click to browse files</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Analyze
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}
