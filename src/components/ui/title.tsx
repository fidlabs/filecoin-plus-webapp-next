import {PropsWithChildren} from "react";


const PageTitle = ({children}: PropsWithChildren) => {
  return <div className="h-[60px] flex flex-col items-end">
    <h1 className="text-3xl leading-loose font-semibold text-white">{children}</h1>
  </div>
}

const PageHeader = ({children}: PropsWithChildren) => {
  return <div className="flex flex-col items-start">
    {children}
  </div>
}

const PageSubTitle = ({children}: PropsWithChildren) => {
  return <div className="h-[30px] flex flex-col items-end">
    <h1 className="text-sm leading-none text-white">{children}</h1>
  </div>
}

export {PageTitle, PageHeader, PageSubTitle}