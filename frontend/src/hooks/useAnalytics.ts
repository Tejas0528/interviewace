import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { analyticsApi } from '@/api/analytics'
import { downloadBlob } from '@/utils/helpers'

export const useAnalytics = () => {
  const queryClient = useQueryClient()

  const dashboard = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 2 * 60 * 1000,
  })

  const roadmap = useQuery({
    queryKey: ['career-roadmap'],
    queryFn: analyticsApi.getCareerRoadmap,
    retry: false,
  })

  const reports = useQuery({
    queryKey: ['reports'],
    queryFn: analyticsApi.getReports,
  })

  const generateRoadmapMutation = useMutation({
    mutationFn: analyticsApi.generateRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-roadmap'] })
      toast.success('Career roadmap generated!')
    },
    onError: () => toast.error('Failed to generate roadmap'),
  })

  const generateReportMutation = useMutation({
    mutationFn: ({ type, sourceId }: { type: 'interview' | 'resume' | 'career'; sourceId: string }) =>
      analyticsApi.generateReport(type, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report generated!')
    },
  })

  const downloadReportMutation = useMutation({
    mutationFn: analyticsApi.downloadReport,
    onSuccess: (blob, reportId) => {
      downloadBlob(blob, `report-${reportId}.pdf`)
      toast.success('Report downloaded!')
    },
    onError: () => toast.error('Failed to download report'),
  })

  return {
    analytics: dashboard.data,
    isLoadingAnalytics: dashboard.isLoading,

    roadmap: roadmap.data,
    isLoadingRoadmap: roadmap.isLoading,

    reports: reports.data ?? [],
    isLoadingReports: reports.isLoading,

    generateRoadmap: generateRoadmapMutation.mutateAsync,
    isGeneratingRoadmap: generateRoadmapMutation.isPending,

    generateReport: generateReportMutation.mutateAsync,
    isGeneratingReport: generateReportMutation.isPending,

    downloadReport: downloadReportMutation.mutate,
    isDownloading: downloadReportMutation.isPending,
  }
}
