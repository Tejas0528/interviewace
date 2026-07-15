import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { resumeApi } from '@/api/resume'

export const useResume = (resumeId?: string) => {
  const queryClient = useQueryClient()

  const resumes = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.getAll,
  })

  const resume = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.getById(resumeId!),
    enabled: !!resumeId,
  })

  const uploadMutation = useMutation({
    mutationFn: resumeApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      toast.success('Resume uploaded successfully!')
    },
    onError: () => toast.error('Failed to upload resume'),
  })

  const analyzeMutation = useMutation({
    mutationFn: (id: string) => resumeApi.analyze(id),
    onSuccess: () => toast.success('Resume analysis complete!'),
    onError: () => toast.error('Analysis failed'),
  })

  const atsMutation = useMutation({
    mutationFn: ({ id, jd }: { id: string; jd?: string }) =>
      resumeApi.getATSScore(id, jd),
  })

  const improveMutation = useMutation({
    mutationFn: (id: string) => resumeApi.improve(id),
    onSuccess: () => toast.success('Resume improved!'),
  })

  const deleteMutation = useMutation({
    mutationFn: resumeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      toast.success('Resume deleted')
    },
  })

  return {
    resumes: resumes.data ?? [],
    resume: resume.data,
    isLoading: resumes.isLoading,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    analyze: analyzeMutation.mutateAsync,
    isAnalyzing: analyzeMutation.isPending,
    analysisResult: analyzeMutation.data,
    getATSScore: atsMutation.mutateAsync,
    isGettingATS: atsMutation.isPending,
    atsResult: atsMutation.data,
    improve: improveMutation.mutateAsync,
    isImproving: improveMutation.isPending,
    improveResult: improveMutation.data,
    deleteResume: deleteMutation.mutate,
  }
}
