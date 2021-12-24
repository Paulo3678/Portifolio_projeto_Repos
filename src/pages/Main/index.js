import React, { useState, useCallback, useEffect } from "react";
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa';
import { Container, Form, SubmitButton, List, DeleteButton } from "./styles";
import api from "./../../services/api";
import { Link } from "react-router-dom";

export default function Main() {
    const [newRepo, setNewRepo] = useState('');
    const [repositorios, setRepositorios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Buscar toda vez que ele iniciar
    useEffect(() => {
        const repoStorage = localStorage.getItem('repos');
        if (repoStorage) {
            setRepositorios(JSON.parse(repoStorage));
        }
    }, []);

    // Salvar alterações
    useEffect(() => {
        localStorage.setItem('repos', JSON.stringify(repositorios));
    }, [repositorios]);

    function handleinputChange(e) {
        setNewRepo(e.target.value);
        setAlert(null);
    }

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        async function submit() {
            setLoading(true);
            setAlert(null)
            try {
                if (newRepo === '') {
                    throw new Error("Você precisa indicar um repositório")
                }

                // Biblioteca para consumir apis: npm install axios
                const response = await api.get(`repos/${newRepo}`);
                // async e await: Faz com que o resto do códifo só seja executado após o await ser concluido
                const data = {
                    name: response.data.full_name
                }

                const hasRepo = repositorios.find(repo => repo.name === newRepo);
                if (hasRepo) {
                    throw new Error("Repositório duplicado")
                }

                setRepositorios([...repositorios, data]);
                setNewRepo('');
            } catch (error) {
                setAlert(true)
                console.log(error);
            } finally {
                setLoading(false);
            }

        }
        submit();
    }, [newRepo, repositorios]);

    const handleDelete = useCallback((repo) => {
        // Verifica todos os dados do array, e aqueles que são diferentes do passado são retornados para o find
        // Depois só é atualizado os repositórios sem o repositorio passado
        const find = repositorios.filter(r => r.name !== repo);
        setRepositorios(find)

    }, [repositorios]);

    return (
        <Container>
            <h1>
                <FaGithub size={25} />
                Meus repositórios
            </h1>

            <Form onSubmit={handleSubmit} error={alert}>
                <input
                    type={"text"}
                    placeholder="Adicionar Repositórios"
                    value={newRepo}
                    onChange={handleinputChange}
                />
                <SubmitButton loading={loading ? 1 : 0}>
                    {
                        loading ? (
                            <FaSpinner color="#FFF" size={14} />
                        ) : (<FaPlus color="#FFF" size={14} />)
                    }
                </SubmitButton>
            </Form>

            <List>
                {repositorios.map(repo => (
                    <li key={repo.name}>
                        <span>
                            <DeleteButton onClick={() => handleDelete(repo.name)}>
                                <FaTrash size={14} />
                            </DeleteButton>
                            <span>{repo.name}</span>
                        </span>
                        {/* encodeURIComponent: fala q i vakir passado é apenas um parâmetro */}
                        <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                            <FaBars size={20} />
                        </Link>
                    </li>
                ))}
            </List>

        </Container>
    )
}