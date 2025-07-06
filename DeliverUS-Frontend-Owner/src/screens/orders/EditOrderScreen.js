import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { Formik } from 'formik'
import { getById, update } from '../../api/OrderEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import TextError from '../../components/TextError'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { buildInitialValues } from '../Helper'

export default function EditOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [orderToEdit, setOrderToEdit] = useState({})
  const [initialOrderValues, setInitialOrderValues] = useState({ address: null, price: null })
  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    price: yup
      .number()
      .positive('Please provide a positive price value')
      .required('Price is required')
  })
  // Como queremos que aparezcan los valores actuales del producto, porque esto es un Edit, aquí si usamos un useEffect
  useEffect(() => {
    async function fetchOrderToEdit () { // Declaramos la función dentro del useEffect
      try {
        const fetchedOrder = await getById(route.params.id) // El id que pasamos en la ruta era el id del order
        setOrderToEdit(fetchedOrder)
        const initialValues = buildInitialValues(fetchedOrder, initialOrderValues) // El buildInitialValues es super importante y lo hemos tenido que importar del helpers
        // OJO!!! Solo funciona si ponemos fetchedOrder en vez de orderToEdit ya que en teoría este no está inicializado
        setInitialOrderValues(initialValues)// Aquí actualizamos los valores iniciales reales, los que cogerá el form
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the order (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrderToEdit()
  }, [route]) // Cada vez que cambian los parámetros de la ruta, es decir, cada vez que se pasa a esta pantalla se ejecuta este useEffect que básicamente sirve para inicializar correctamente los valores iniciales

  const updateOrder = async (values) => {
    setBackendErrors([]) // Inicialmente vacíos
    try {
      await update(orderToEdit.id, values)
      showMessage({
        message: `Order ${orderToEdit.id} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // Tras actualizar la edición se navega de nuevo a la pantalla del listado de pedidos donde se tiene que reflejar el cambio efectuado
      navigation.navigate('OrdersScreen', { id: orderToEdit.restaurantId })
    } catch (error) {
      showMessage({
        message: `There was an error while updating the order (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      setBackendErrors(error.errors) // No olvidar poner error.errors
    }
  }

  return (
    <>
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialOrderValues}
      onSubmit={updateOrder}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='address'
                label='Address:'
              />
              <InputItem
                name='price'
                label='Price:'
              />
              {/* Mostrar los backendErrors antes del botón save */}
              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={ handleSubmit } // Simplemente poner handleSubmit, llamará a la función que haya en la prop onSubmit pasándole como parámetros los valores del formulario
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  }
})
