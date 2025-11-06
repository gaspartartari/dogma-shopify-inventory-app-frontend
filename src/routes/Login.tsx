/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState } from 'react';
import { loginRequest } from '../services/auth-service';
import { type CredentialsDTO } from '../models/auth';
import * as authService from '../services/auth-service';
import { useNavigate } from 'react-router-dom';
import { ContextToken } from '../utils/context-token';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

export function LoginPage() {

    const navigate = useNavigate();

    const { setContextTokenPayload } = useContext(ContextToken);

    const [formData, setFormData] = useState<CredentialsDTO>({
        username: '',
        password: '',
    })

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleLogin = async (e: any) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        if (!formData.username || !formData.password) {
            setErrors({
                general: 'Por favor, preencha todos os campos'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await loginRequest(formData);
            console.log(response.data)
            const data = response.data;
            if (data) {
                authService.saveAccessToken(data.access_token);
                setContextTokenPayload(authService.getAccessTokenPayload());
                if (authService.hasAnyRoles(['ROLE_ADMIN', "ROLE_OPERATOR"])) {
                    toast.success('Login realizado com sucesso!');
                    navigate('/');
                } else {
                    setErrors({
                        general: 'Usuário não possui permissões necessárias'
                    });
                }
                console.log(authService.getAccessTokenPayload());
            }
        } catch (error: any) {
            console.log("Erro no login", error);

            if (error.response?.status === 401) {
                setErrors({
                    general: 'Credenciais inválidas. Verifique seu usuário e senha.'
                });
            } else if (error.response?.status === 403) {
                setErrors({
                    general: 'Acesso negado. Usuário não autorizado.'
                });
            } else if (error.response?.status == 400) {
                setErrors({
                    general: "Login ou senha inválidos."
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    function handleInputChange(event: any) {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear errors when user starts typing
        if (errors.general) {
            setErrors({});
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
            <div className="bg-bg-primary shadow-lg rounded-lg p-8 w-full max-w-md border border-border-default">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Inventory Sync</h2>
                    <p className="text-sm text-text-secondary">Faça login para acessar o sistema</p>
                </div>

                {errors.general && (
                    <div className="mb-4 p-4 bg-status-error/10 border border-status-error/30 rounded-md">
                        <p className="text-sm text-status-error font-medium">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                            Email
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 bg-bg-primary border border-border-default rounded-lg shadow-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-3 pr-12 bg-bg-primary border border-border-default rounded-lg shadow-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 text-text-primary font-semibold bg-bg-brand hover:bg-bg-brand-hover rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>
                {/* <div className="text-center mt-4 text-sm text-text-secondary">
          Precisa criar uma conta? <a href="/signup" className="text-brand-500 hover:underline">Criar Conta</a>
        </div> */}
            </div>
        </div>
    );
}
