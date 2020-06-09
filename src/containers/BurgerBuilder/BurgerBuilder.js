import React, { Component } from 'react';

import Auxiii from '../../hoc/Auxiii/Auxiii';
import Burger from '../../components/Burger/Burger';
import BuildControles from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    };

    componentDidMount () {
        axios.get('https://my-burger-c7dea.firebaseio.com/ingedients.json')
        .then(response => {
            this.setState({ingredients: response.data})
        }).catch(error => {
            this.setState({error: true})
        })
    }

    UpdatePurchaseState (ingredients) {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);

        this.setState({purchasable: sum > 0});
    }

    AddIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updateCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updateCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
        this.UpdatePurchaseState(updatedIngredients);
    }

    RemoveIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0) {
            return;
        }
        const updateCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updateCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
        this.UpdatePurchaseState(updatedIngredients);
    }

    PurchaseHandler = () => {
        this.setState({purchasing: true});
    }

    PurchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    PurchaseContinueHandler = () => {
        this.setState({loading: true});
        // alert("You continue!!!");
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Mosa Pucko',
                address: {
                    street: 'Mite Balije bb',
                    zipCode: '54345',
                    country: 'Serbia',
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'fastest'
        };

        axios.post('/orders.json', order)
            .then(responce => {
                this.setState({loading: false, purchasing: false});
            })
            .catch(error => {
                this.setState({loading: false, purchasing: false});
            });
    }

    render () {
        const disabledInfo = {
            ...this.state.ingredients
        };

        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner />

        if(this.state.ingredients) {
            burger = (
                <Auxiii>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControles
                        ingredientAdded={this.AddIngredientHandler}
                        ingredientRemoved={this.RemoveIngredientHandler}
                        disabled={disabledInfo}
                        ordered={this.PurchaseHandler}
                        price={this.state.totalPrice}
                        purchasable={this.state.purchasable} />
                </Auxiii>
            );
            orderSummary = <OrderSummary
                ingredients={this.state.ingredients}
                purchaseCancelled={this.PurchaseCancelHandler}
                purchaseContinued={this.PurchaseContinueHandler}
                price={this.state.totalPrice} />;
        };

        if(this.state.loading) {
            orderSummary = <Spinner />;
        };

        return (
            <Auxiii>
                <Modal show={this.state.purchasing} modalClosed={this.PurchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Auxiii>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);