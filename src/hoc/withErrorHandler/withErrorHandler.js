import React, { Component } from 'react';

import Modal from '../../components/UI/Modal/Modal';
import Auxiii from '../Auxiii/Auxiii';

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends Component {

        state = {
            error: null
        }

        componentWillMount () {
            this.reqInterceptopr = axios.interceptors.request.use(req => {
                this.setState({error: null});
                return req;
            });
            this.resInterceptopr = axios.interceptors.response.use(res => res, error => {
                this.setState({error: error});
            });
        }

        componentWillUnmount () {
            axios.interceptors.request.eject(this.reqInterceptopr);
            axios.interceptors.response.eject(this.reqInterceptopr);
        }

        errorConfirmedHandler = () => {
            this.setState({error: null});
        }

        render() {
            return (
                <Auxiii>
                    <Modal 
                        show={this.state.error}
                        modalClosed={this.errorConfirmedHandler}>
                        {this.state.error ? this.state.error.message : null}
                    </Modal>
                    <WrappedComponent {...this.props} />
                </Auxiii>
            )
        }
    }
};

export default withErrorHandler;