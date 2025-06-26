/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getDetail, getRestaurantAnalytics, getRestaurantOrders } from '../../api/RestaurantEndpoints'
import { nextStatus } from '../../api/OrderEndpoints'

import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { API_BASE_URL } from '@env'
import pendingOrderImage from '../../../assets/order_status_pending.png'
import inProcessOrderImage from '../../../assets/order_status_in_process.png'
import sentOrderImage from '../../../assets/order_status_sent.png'
import deliveredOrderImage from '../../../assets/order_status_delivered.png'
import ImageCard from '../../components/ImageCard'

export default function OrdersScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [orders, setOrders] = useState([]) // Es una lista con objetos de tipo pedido
  const [restaurantAnalytics, setRestaurantAnalytics] = useState({})

  useEffect(() => {
    fetchRestaurantDetail()
    fetchRestaurantOrders()
    fetchRestaurantAnalytics()
  }, [route])

  // Los Restautant Analytics serán usados para el ejercicio 3
  const fetchRestaurantAnalytics = async () => {
    try {
      const fetchedAnalytics = await getRestaurantAnalytics(route.params.id) // Toma como parámetro el id del restaurante---> TENEMOS QUE IMPLEMENTAR ESTE ENDPOINT
      setRestaurantAnalytics(fetchedAnalytics) // A partir de ahora podemos usar el objeto actualizado restaurantAnalytics para el diseño.
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant analytics. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  // Los pedidos del restaurante son necesarios para el ejercicio 1
  const fetchRestaurantOrders = async () => {
    try {
      const fetchedOrders = await getRestaurantOrders(route.params.id) // Hemos conocido este parámetro viéndolo en el navigate de la pantalla RestaurantDetails
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant orders. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  // HandleNextStatus será usado para el ejercicio 4, tiene que ver con el cambio de estado
  const handleNextStatus = async (order) => {
    try {
      await nextStatus(order) // Esto ya actualiza el pedido (hace un patch interno)
      showMessage({
        message: `Order ${order.id} status updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // Actualizamos la página entera haciendo el fetch
      fetchRestaurantOrders() // Aquí ya se encontrará el pedido actualizado
      fetchRestaurantAnalytics() // Las analíticas actualizadas por si acaso
    } catch (error) {
      showMessage({
        message: `There was an error while changing order status. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderAnalytics = () => {
    return (
      <View style={styles.analyticsContainer}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCell}>
              <TextRegular textStyle={styles.text}>
                Invoiced today
              </TextRegular>
              <TextSemiBold textStyle={styles.text}>
              {restaurantAnalytics.invoicedToday}
              </TextSemiBold>
            </View>
            <View style={styles.analyticsCell}>
              <TextRegular textStyle={styles.text}>
                #Pending orders
              </TextRegular>
              <TextSemiBold textStyle={styles.text}>
              {restaurantAnalytics.numPendingOrders}
              </TextSemiBold>
            </View>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCell}>
                <TextRegular textStyle={styles.text}>
                  #Delivered today
                </TextRegular>
                <TextSemiBold textStyle={styles.text}>
                {restaurantAnalytics.numDeliveredTodayOrders}
                </TextSemiBold>
              </View>
              <View style={styles.analyticsCell}>
                <TextRegular textStyle={styles.text}>
                  #Yesterday orders
                </TextRegular>
                <TextSemiBold textStyle={styles.text}>
                {restaurantAnalytics.numYesterdayOrders}
                </TextSemiBold>
              </View>
          </View>
        </View>
    )
  }
  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
        {/* En el propio renderHeader metemos el renderAnalytics */}
        {renderAnalytics()} {/* POR DIOS NO OLVIDAR PONER LOS PARÉNTESIS DE LAS FUNCIONESSSSSSSS */}
      </View>
    )
  }

  const getOrderImage = (status) => {
    switch (status) {
      case 'pending':
        return pendingOrderImage
      case 'in process':
        return inProcessOrderImage
      case 'sent':
        return sentOrderImage
      case 'delivered':
        return deliveredOrderImage
    }
  }
  // Renderizamos el pedido para el ejercicio 1
  const renderOrder = ({ item }) => {
    return ( // Que no se te olvide el return que por esto la cagaste en el anterior examen
      <ImageCard
          imageUri={getOrderImage(item.status)} // Así de fácil es poner una imagen cuando la tienes en local
          title= {`Order created at ${item.createdAt}`}
      >
      <View style={{ flex: 1, marginBottom: 40 }}>
      <TextRegular style={styles.orderText}>Status:{item.status}</TextRegular>
      <TextRegular style={styles.orderText}>Address:{item.address}</TextRegular>
      <TextSemiBold>{item.price}€</TextSemiBold>
      </View>
      {/* Aquí van los botones de edición y el de Advance */}
      <View style={styles.actionButtonsContainer}>
      <Pressable
        onPress={() => { navigation.navigate('EditOrderScreen', { id: item.id, address: item.address, price: item.price }) }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandBlueTap
              : GlobalStyles.brandBlue
          },
          styles.actionButton
        ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='pencil' color={'white'} size={20}></MaterialCommunityIcons>
          <TextRegular style={styles.text}>Edit</TextRegular>
          </View>
        </Pressable>
        { item.status !== 'delivered' &&
        <Pressable
          onPress={() => handleNextStatus(item)} // Hay que pasarle el order como parámetro
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandBlueTap
                : GlobalStyles.brandBlue
            },
            styles.actionButton
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='skip-next' color={'white'} size={20}></MaterialCommunityIcons>
          <TextRegular style={styles.text}>Advance</TextRegular>
          </View>
        </Pressable>
        }
        </View>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no orders yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  // Return principal
  return (
      <>
        <FlatList
              style={styles.container}
              data={orders}
              renderItem={renderOrder}
              keyExtractor={item => item.id.toString()}
              ListHeaderComponent={renderHeader} // En el header es donde van las analíticas
              ListEmptyComponent={renderEmptyOrdersList}
        />
      </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  orderText: {
    fontSize: 14,
    color: 'black',
    alignSelf: 'flex-start'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%',
    marginTop: 70,
    gap: 8
  },
  analyticsContainer: {
    backgroundColor: GlobalStyles.brandPrimaryTap,
    paddingVertical: 10
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 15
  },
  analyticsCell: {
    margin: 5,
    color: 'white',
    fontSize: 12,
    width: '45%',
    backgroundColor: GlobalStyles.brandPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.41,
    shadowRadius: 3.11,
    elevation: 2
  }
})
