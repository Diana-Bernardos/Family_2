import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ShoppingList.css';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const response = await api.getShoppingList();
            setItems(response.data);
        } catch (error) {
            console.error('Error loading shopping list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        try {
            const response = await api.addShoppingItem(newItem);
            setItems([response.data, ...items]);
            setNewItem('');
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            await api.updateShoppingItem(id, !currentStatus);
            setItems(items.map(item => 
                item.id === id ? { ...item, completed: !currentStatus } : item
            ));
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteShoppingItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    if (loading) return <div className="loading">Cargando lista...</div>;

    return (
        <div className="shopping-page">
            <div className="page-header">
                <h1>Lista de la Compra</h1>
            </div>

            <div className="shopping-container">
                <form onSubmit={handleAddItem} className="add-item-form">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Añadir nuevo producto..."
                        className="form-control"
                    />
                    <button type="submit" className="btn btn-primary">
                        ➕ Añadir
                    </button>
                </form>

                <div className="shopping-list">
                    {items.length === 0 ? (
                        <p className="empty-state">No hay items en la lista</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className={`shopping-item ${item.completed ? 'completed' : ''}`}>
                                <div className="item-content" onClick={() => handleToggle(item.id, item.completed)}>
                                    <input
                                        type="checkbox"
                                        checked={!!item.completed}
                                        readOnly
                                        className="checkbox"
                                    />
                                    <span className="item-text">{item.item}</span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="delete-btn"
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingList;
