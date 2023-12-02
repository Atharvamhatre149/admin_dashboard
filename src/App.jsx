
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import spinner from '../public/Spinner.svg';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { PrimeIcons } from 'primereact/api';
import './App.css';

const App=()=> {


    let emptyUser = {
        id: null,
        name: '',
        email: '',
        role: ''
    };

    const [users, setUsers] = useState(null);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const toast = useRef(null);
    const dt = useRef(null);
    const [isLoading,setIsLoading]=useState(true);
    const [error,setError]=useState(null);
    

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        role: { value: null, matchMode: FilterMatchMode.IN }
    });

   


  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
            
            if (!response.ok) {
                // Handle non-successful responses
                throw new Error('Network request failed');
            }
            
            const result = await response.json();
            console.log(result);
            setUsers(result);
            
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
       
    };

    fetchData();
  }, []);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };




    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };





    const deleteUser = (user) => {
        
        setUser(user);
        // console.log(user);
        let _users = users.filter((val) => val.id !== user.id);

        setUsers(_users);
        setDeleteUserDialog(false);
        setUser(emptyUser);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };


    const confirmDeleteSelected = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = () => {
        let _users = users.filter((val) => !selectedUsers.includes(val));

        setUsers(_users);
        setDeleteUsersDialog(false);
        setSelectedUsers(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
    };

   

    const onRowEditComplete = (e) => {
        let _users = [...users];
        let { newData, index } = e;

        _users[index] = newData;

        setUsers(_users);
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            
            <Button icon="pi pi-trash" rounded text  severity="danger" onClick={() => deleteUser(rowData)} />
            
        );
    };



    const header = (
        <div className="flex flex-wrap gap-1 align-items-center justify-content-between">
            <h4 className='headingUser'>Manage Users</h4>
            <div className='toolbar'>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search..." />
                </span>
                <Button icon="pi pi-trash" severity="danger"  onClick={confirmDeleteSelected} disabled={!selectedUsers || !selectedUsers.length}/>
            </div>
        </div>
    );
 
  
    const deleteUsersDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUsersDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedUsers} />
        </React.Fragment>
    );

    return (
        <>
       
        {isLoading ? 
            (<div className='spinner'>
                <img src={spinner} alt="" />
            </div>)
            :

        (<div>
            <Toast ref={toast} />
            <div className="card">
                {/* <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar> */}

                <DataTable ref={dt} value={users} selection={selectedUsers} selectionPageOnly filters={filters} editMode="row" onRowEditComplete={onRowEditComplete} onSelectionChange={(e) => setSelectedUsers(e.value)}
                        dataKey="id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Users" globalFilterFields={['name', 'email', 'role']} header={header}>
                    <Column selectionMode="multiple" style={{ padding:'10px', minWidth: '2rem' }} exportable={false}></Column>
                   
                    <Column field="name" header="Name" sortable editor={(options) => textEditor(options)} style={{ minWidth: '16rem', padding:'5px' }}></Column>
                    <Column field="email" header="Email" sortable editor={(options) => textEditor(options)} style={{ minWidth: '10rem',padding:'5px' }}></Column>
                    <Column field="role" header="Role"  sortable editor={(options) => textEditor(options)}  style={{ minWidth: '10rem',padding:'5px' }}></Column>
                    <Column rowEditor header="Actions" className='edit' headerStyle={{ width: '5%', minWidth: '4rem',padding:"5px 5px 5px 65px"}} bodyStyle={{ textAlign: 'center',padding:'5px' }}></Column>
                    <Column  body={actionBodyTemplate} className='delete' exportable={false} style={{ minWidth: '8rem', padding:'1px' }}></Column>
                </DataTable>
            </div>


            <Dialog visible={deleteUsersDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && <span>Are you sure you want to delete the selected users?</span>}
                </div>
            </Dialog>
        </div>)
        }
    </>
    );
}
 

export default App;
