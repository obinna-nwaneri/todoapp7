import { useCallback, useEffect, useState } from 'react'

import client from '../api/client.js'

const usePaginatedResource = (endpoint, initialParams = {}) => {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialParams)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { ...filters, page }
      if (search) {
        params.search = search
      }
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      const { data } = await client.get(endpoint, { params })
      setItems(data.results || data)
      setCount(data.count || (Array.isArray(data) ? data.length : 0))
    } catch (err) {
      setError('Unable to fetch data from the server.')
    } finally {
      setLoading(false)
    }
  }, [endpoint, filters, page, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearchChange = (value) => {
    setPage(1)
    setSearch(value)
  }

  const applyFilters = (newFilters) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return {
    items,
    count,
    page,
    setPage,
    loading,
    error,
    search,
    setSearch: handleSearchChange,
    filters,
    setFilters: applyFilters,
    refresh: fetchData,
  }
}

export default usePaginatedResource
