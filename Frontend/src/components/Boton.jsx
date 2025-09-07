


const estiloBoton = {
    backgroundColor: '#35332e',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    margin: '15px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'transform 0.2s ease-in-out',
};



export default function Boton() {

    


    return (
        <>

            <button style={estiloBoton}>Guardar Ubicacion</button>
            <button style={estiloBoton}>Mostrar Ubicaciones</button>

        </>
    )
}