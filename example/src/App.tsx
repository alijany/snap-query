import { useMemo, useState } from 'react'
import { queryHook } from './api'
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

  console.log({ queryResult });


  return (
    <div>
      {queryResult.isError && 'error in query'}
      <div>{queryResult.isLoading && 'loading'}</div>
      <div>{queryResult.isSuccess && queryResult.data.title}</div>

      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App
