interface CosumingPropsProps {
  name: string
}

const CosumingProps: React.FC<CosumingPropsProps> = ( {name }) => {
  return (
  <h1>Name: {name}</h1>
  )
}

export default CosumingProps
