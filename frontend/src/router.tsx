import { AuthRoutes } from '@/features/auth/AuthRoutes'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export default function Router(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path='/auth/*' element={<AuthRoutes/>}/>
            </Routes>
        </BrowserRouter>
    )
}