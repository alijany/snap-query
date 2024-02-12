import { useEffect, useMemo, useState } from 'react'
import { mutateHook, queryHook } from './api'
import { z } from 'zod'



function App() {
  const [count, setCount] = useState(1)

  const queryParams = useMemo(() => ({
    pathParams: {
      id: count
    },
    validator: z.object({
      "userId": z.number(),
      "id": z.number(),
      "title": z.string(),
      "completed": z.boolean(),

    })
  }), [count])

  const queryResult = queryHook(queryParams)


  const mutateParams = useMemo(() => ({
    // pathParams: {
    //   id: count
    // },
    validator: z.object({
      "userId": z.number(),
      "id": z.number(),
      "title": z.string(),
      "completed": z.boolean(),

    })
  }), [count])

  const [{ mutate }, mutateRes] = mutateHook(mutateParams)

  useEffect(() => {
    mutate({
      pathParams: {
        id: count
      }
      })
  }, [])

  return (
    <div>
      {queryResult.isError && 'error in query'}
      <div>{queryResult.isLoading && 'mutate loading'}</div>
      <div>{queryResult.isSuccess && queryResult.data.title}</div>

      {mutateRes.isError && 'error in mutate'}
      <div>{mutateRes.isLoading && 'mutate loading'}</div>
      <div>{mutateRes.isSuccess && mutateRes.data.title}</div>
      

      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App
