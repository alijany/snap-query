import { LazyResponse } from '../../src';
import { ResType } from './App';


export const UserDataComponent = ({ resource }: { resource: LazyResponse<ResType> }) => {
  const res = resource.read();

  if (res?.error) {
    return <div>Error</div>
  }

  return (
    <div>
      <h1>{res?.data?.id}</h1>
      <p>{res?.data?.title}</p>
    </div>
  );
};

