// GET all loads (including assigned driver and truck details)
app.get('/api/loads', async (req, res) => {
  try {
    const loads = await prisma.load.findMany({
      include: {
        driver: true,
        truck: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(loads);
  } catch (error) {
    console.error('Error fetching loads:', error);
    res.status(500).json({ error: 'Failed to fetch loads' });
  }
});

// CREATE a new load
app.post('/api/loads', async (req, res) => {
  try {
    const { loadNumber, shipper, origin, destination, rate, status, driverId, truckId, pickupDate, deliveryDate } = req.body;
    
    const newLoad = await prisma.load.create({
      data: {
        loadNumber,
        shipper,
        origin,
        destination,
        rate: parseFloat(rate),
        status: status || 'PENDING',
        driverId: driverId || null,
        truckId: truckId || null,
        pickupDate: new Date(pickupDate),
        deliveryDate: new Date(deliveryDate),
      },
      include: {
        driver: true,
        truck: true,
      },
    });
    res.json(newLoad);
  } catch (error) {
    console.error('Error creating load:', error);
    res.status(500).json({ error: 'Failed to create load' });
  }
});