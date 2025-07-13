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
import { buildInitialValues } from '../Helper' // Muy importante para las pantallas de Edit

export default function EditOrderScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [initialOrderValues, setInitialOrderValues] = useState({ address: null, price: null })
  // Siempre que hay un Formik tenemos en cuenta los backendErrors
  const [backendErrors, setBackendErrors] = useState() // Lo inicializamos vacío

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

  // Como esta pantalla es un Edit, tenemos que hacer un useEffect para que busque las características del pedido
  useEffect(() => {
    async function fetchOrderDetail () {
      try {
        const fetchedOrder = await getById(route.params.id) // Pasamos de la pantalla anterior el id del order como route.param
        setOrder(fetchedOrder)
        const initialValues = buildInitialValues(fetchedOrder, initialOrderValues)
        setInitialOrderValues(initialValues)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrderDetail() // Que no se olviden los paréntesis ()
  }, [route])

  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      // Primero actualizamos el order
      const updatedOrder = await update(route.params.id, values)
      showMessage({
        message: `Order ${updatedOrder.id} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // En un formulario lo normal es que vayamos a la pantalla anterior tras modificarlo
      navigation.navigate('OrdersScreen', { id: order.restaurantId }) // Pasamos como parámetro el id del restaurante al que pertenece el order
    } catch (error) {
      console.log(error)
      showMessage({
        message: 'Order can not be updated',
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      setBackendErrors(error.errors) // No olvidar poner el errors.
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

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={ handleSubmit }
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
