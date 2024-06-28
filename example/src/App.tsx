import { Suspense, useEffect, useMemo, useState } from 'react'
import { emitQueryHook, lazyHook, mutateHook, queryHook } from './api'
import { z } from 'zod'
import { UserDataComponent } from './componenet.userData'

export const ResDto = z.object({
  "userId": z.number(),
  "id": z.number(),
  "title": z.string(),
  "completed": z.boolean(),
})

export type ResType = z.infer<typeof ResDto>


function App() {
  const [count, setCount] = useState(1)

  const queryParams = useMemo(() => ({
    pathParams: {
      id: count
    },
    validator: ResDto
  }), [count])

  const queryResult = queryHook(queryParams)


  const [{ mutate }, mutateRes] = mutateHook({
    // pathParams: {
    //   id: count
    // },
    subscribers: [emitQueryHook],
    validator: ResDto
  })

  console.log({ mutateRes });


  useEffect(() => {
    setTimeout(() => {
      mutate({
        pathParams: {
          id: count
        }
      })
    }, 5000)
  }, [count])


  const lazyResult = lazyHook(queryParams)


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

      <br />

      <div>lazy load:</div>
      <Suspense fallback={<div>loading . . .</div>}>
        <UserDataComponent resource={lazyResult} />
      </Suspense>
    </div>
  )
}

export default App
