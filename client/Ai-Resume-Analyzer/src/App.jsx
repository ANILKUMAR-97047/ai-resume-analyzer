import { useState, useCallback } from "react"
import axios from "axios"
import { Sparkles, FileText, Send, CheckCircle2, AlertCircle, Loader2, UploadCloud, File, X, FileType2 } from "lucide-react"
import { useDropzone } from "react-dropzone"

function App() {
  const [mode, setMode] = useState("text") // "text" | "pdf"
  const [resume, setResume] = useState("")
  const [pdfFile, setPdfFile] = useState(null)

  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setPdfFile(acceptedFiles[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const clearPdf = (e) => {
    e.stopPropagation();
    setPdfFile(null);
  };

  const analyzeResume = async () => {
    if (mode === "text" && !resume.trim()) return;
    if (mode === "pdf" && !pdfFile) return;

    setError("");
    setResult("");
    setLoading(true);

    try {
      let response;

      if (mode === "text") {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/analyze`,
          { resumeText: resume }
        )
      } else {
        const formData = new FormData();
        formData.append("pdfFile", pdfFile);

        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/analyze-pdf`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        )
      }

      setResult(response.data.result)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || "We encountered an issue analyzing your resume. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col items-center py-12 px-4 sm:px-8 relative z-0">

      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col">

        {/* Header Section */}
        <div className="px-8 py-12 sm:px-12 sm:py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          {/* subtle moving light effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md mb-6 shadow-inner inline-flex items-center justify-center border border-white/20">
              <Sparkles className="w-10 h-10 text-blue-100" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-100 drop-shadow-sm">
              AI Resume Analyzer
            </h1>
            <p className="text-blue-100/90 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Unlock your career potential. Upload your PDF or paste your resume below to get instant AI insights.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-8 sm:p-12 grow flex flex-col">
          <div className="space-y-6 flex-grow">

            {/* Mode Toggle Tabs */}
            <div className="flex p-1 space-x-1 bg-slate-100/80 rounded-xl w-full sm:w-fit mx-auto border border-slate-200/60 shadow-inner mb-8">
              <button
                onClick={() => setMode("text")}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "text" ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Text</span>
              </button>
              <button
                onClick={() => setMode("pdf")}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "pdf" ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
              >
                <FileType2 className="w-4 h-4" />
                <span>Upload PDF</span>
              </button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>

              {mode === "text" ? (
                /* Text Input View */
                <div className="relative bg-white rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/10">
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center space-x-2 text-slate-500 text-sm font-semibold rounded-tl-sm rounded-tr-2xl">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Resume Content</span>
                  </div>
                  <textarea
                    className="w-full p-5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 border-none resize-y min-h-[280px] bg-transparent leading-relaxed text-base sm:text-lg"
                    placeholder="e.g., Experienced Software Engineer with a demonstrated history of working in the tech industry..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                </div>
              ) : (
                /* PDF Upload View */
                <div
                  {...getRootProps()}
                  className={`relative min-h-[320px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer overflow-hidden ${isDragActive ? "border-blue-500 bg-blue-50" : pdfFile ? "border-emerald-400 bg-emerald-50/30" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
                    }`}
                >
                  <input {...getInputProps()} />

                  {pdfFile ? (
                    <div className="flex flex-col items-center text-center space-y-4 z-10 animate-in zoom-in-95 duration-300">
                      <div className="bg-emerald-100 p-4 rounded-full">
                        <File className="w-12 h-12 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800 break-all">{pdfFile.name}</p>
                        <p className="text-slate-500 mt-1 font-medium">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={clearPdf}
                        className="mt-2 text-sm text-red-500 font-bold hover:text-red-700 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove File</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-4 z-10">
                      <div className={`p-4 rounded-full shadow-sm transition-colors duration-300 ${isDragActive ? 'bg-blue-100' : 'bg-white'}`}>
                        <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-700">
                          {isDragActive ? "Drop your PDF here!" : "Drag & Drop your PDF"}
                        </p>
                        <p className="text-slate-500 mt-2 font-medium">
                          or click to browse from your computer
                        </p>
                      </div>
                      <div className="mt-4 inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 shadow-sm">
                        Supported Format: PDF
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={analyzeResume}
                disabled={loading || (mode === "text" && !resume.trim()) || (mode === "pdf" && !pdfFile)}
                className={`relative overflow-hidden group px-8 sm:px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center space-x-3 w-full sm:w-auto ${(loading || (mode === "text" && !resume.trim()) || (mode === "pdf" && !pdfFile)) ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-0"
                  }`}
              >
                {!loading && ((mode === "text" && resume.trim()) || (mode === "pdf" && pdfFile)) && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                <span className="relative z-10 flex items-center space-x-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Resume</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-8 transition-all duration-500 opacity-100 translate-y-0">
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-bold mb-1">Analysis Failed</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && !loading && !error && (
            <div className="mt-12 transition-all duration-700 ease-out opacity-100 translate-y-0">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-emerald-100 p-2.5 rounded-full shadow-sm">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Insights & Feedback</h2>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-teal-600"></div>
                <div className="p-6 sm:p-8 md:p-10 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {result}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 mb-6 flex items-center space-x-2 text-slate-500 text-sm font-medium tracking-wide">
        <span>Powered by Advanced AI</span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        <span>Built for your Career</span>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default App