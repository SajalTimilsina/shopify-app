import React from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';

export function NavigationBar() {
  return (
<div className='navmenu-section'>
        <ul>
        <li title='Home'>
          <NavLink to="/" className={({isActive}) => isActive ? "active": ""}> 
            <HomeIcon /> 
          </NavLink>
        </li>
        <li title='Menu'><NavLink to="/menu" className={({isActive}) => isActive ? "active": ""}> <MenuIcon /> </NavLink></li>
        <li title='MasterList'><NavLink to="/masterlistform" className={({isActive}) => isActive ? "active": ""}> <InfoIcon /> </NavLink></li>
        <li title='Statistics'><NavLink to="/statistics" className={({isActive}) => isActive ? "active": ""}> <TrendingUpIcon /> </NavLink></li>
        <li title='Users'><NavLink to="/customerprofileform" className={({isActive}) => isActive ? "active": ""}> <GroupIcon /> </NavLink></li>
        <li title='Settings'><NavLink to="/settings" className={({isActive}) => isActive ? "active": ""}> <SettingsIcon /> </NavLink></li>
      </ul>
    </div>

  )
}