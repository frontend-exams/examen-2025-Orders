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

export default function EditOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState([])
  const [order, setOrder] = useState({})
  const [initialValues, setInitialValues] = useState({ address: '', price: '' })

  useEffect(() => {
    async function fetchOrder () {
      try {
        const fetchedOrder = await getById(route.params.id)
        setOrder(fetchedOrder)
        setInitialValues({
          address: fetchedOrder.address,
          price: fetchedOrder.price.toString()
        })
      } catch (error) {
        showMessage({
          message: `Error loading order ${route.params.orderId}. ${error}`,
          type: 'danger',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrder()
  }, [route.params.id])
  // Creamos el validationSchema
  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(255, 'Address is too long')
      .required('Address is required'), // Esto se nos pide como requisito, informar que este campo es obligatorio y que aparezca un mensaje de error si no se ha escrito nada en el campo
    // Van separados por comas
    price: yup
      .number()
      .positive('Please provide a valid price value (greather than 0)')
      .required('Price value is required')
  })
  // Los valores iniciales para que aparezcan ya en los campos ----> Son los que hemos pasado en el route del navigation
  // const initialOrderValues = { address: route.params.address, price: route.params.price }

  // Cuando estamos trabajando con funciones como create o update tenemos que gestionar los backend errors
  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      await update(order.id, values) // No hace falta que lo metamos en una variable con un const
      showMessage({
        message: `Order has been updated successfully: ${order}`,
        type: 'success',
        style: GlobalStyles.brandSuccess,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // Navegamos a otra pantalla cuando actualizamos un Order
      navigation.navigate('OrdersScreen', { id: order.restaurantId, dirty: true }) // Al pasarle como route.params el id del restaurante conseguiremos que se re renderice la pantalla a la que volvemos, por lo que ahora sí se verá el pedido actualizado
    } catch (error) {
      showMessage({
        message: `There was an error while updating the order. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      console.log(error)
      setBackendErrors(error.errors) // Añadimos los errores al estado por si hay que mostrarlos luego
    }
  }

  return (
    <>
<Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialValues}
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
              {/* Esto sirve para mostrar los errores del backend en una parte del formulario */}
              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={handleSubmit} // handleSubmit coge los nuevos valores y llama a la función que haya en la prop onSubmit pasándole los valores como parámetros
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
