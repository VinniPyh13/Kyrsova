import axios from 'axios';

const API_KEY = process.env.API_KEY_NOVA_POST; // Ваша API ключ від Нової Пошти

const novaPoshtaApiUrl = 'https://api.novaposhta.ua/v2.0/json/';

const sendRequest = async (data) => {
  try {
    const response = await axios.post(novaPoshtaApiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch data from Nova Poshta');
  }
};

export const getCities = async (req, res) => {
  try {
    const requestData = {
      apiKey: API_KEY,
      modelName: 'Address',
      calledMethod: 'getCities',
      methodProperties: {},
    };

    const data = await sendRequest(requestData);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities from Nova Poshta' });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const { cityRef } = req.query;
    if (!cityRef) return res.status(400).json({ error: 'Missing cityRef' });

    const requestData = {
      apiKey: API_KEY,
      modelName: 'Address',
      calledMethod: 'getWarehouses',
      methodProperties: { CityRef: cityRef },
    };

    const data = await sendRequest(requestData);

    const warehouses = data.data.map((warehouse) => ({
      description: warehouse.Description,
      address: warehouse.ShortAddress,
      phone: warehouse.Phone,
      schedule: warehouse.Schedule,
      maxWeight: warehouse.TotalMaxWeightAllowed,
    }));

    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses from Nova Poshta' });
  }
};
