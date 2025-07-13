import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, ShoppingCart, Users, Package, Leaf, Microscope, Heart, Brain, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, insertProductSchema, type Customer, type Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Sales() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  // Data fetching
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Customer form
  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      customerType: "individual",
      preferredPayment: "",
      notes: "",
      isActive: true,
    },
  });

  // Product form
  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      category: "fresh_mushrooms",
      description: "",
      sellingPrice: "0",
      costPrice: "0",
      unit: "kg",
      currentStock: "0",
      minimumStock: "5",
      isActive: true,
    },
  });

  // Mutations
  const customerMutation = useMutation({
    mutationFn: (data: any) => {
      return editingItem
        ? apiRequest("PATCH", `/api/customers/${editingItem.id}`, data)
        : apiRequest("POST", "/api/customers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setActiveDialog(null);
      setEditingItem(null);
      customerForm.reset();
      toast({
        title: "Success",
        description: editingItem ? "Customer updated!" : "Customer created!",
      });
    },
  });

  const productMutation = useMutation({
    mutationFn: (data: any) => {
      return editingItem
        ? apiRequest("PATCH", `/api/products/${editingItem.id}`, data)
        : apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setActiveDialog(null);
      setEditingItem(null);
      productForm.reset();
      toast({
        title: "Success",
        description: editingItem ? "Product updated!" : "Product created!",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer deleted!" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Success", description: "Product deleted!" });
    },
  });

  const openCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setEditingItem(customer);
      customerForm.reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        customerType: customer.customerType,
        preferredPayment: customer.preferredPayment || "",
        notes: customer.notes || "",
        isActive: customer.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      customerForm.reset();
    }
    setActiveDialog("customer");
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingItem(product);
      productForm.reset({
        name: product.name,
        category: product.category,
        description: product.description || "",
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice || "0",
        unit: product.unit,
        currentStock: product.currentStock || "0",
        minimumStock: product.minimumStock || "5",
        isActive: product.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      productForm.reset();
    }
    setActiveDialog("product");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hero Section with Educational Content */}
      <div className="relative overflow-hidden rounded-2xl mushroom-gradient p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Mycopath Premium Products</h1>
              <p className="text-white/90">Nature's Innovation Lab - From Nepal's Mountains</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">🍄 About Our Mushrooms</h3>
              <p className="text-white/90 leading-relaxed">
                Grown in the pristine environment of Nepal's mountains, our mushrooms are cultivated using 
                traditional wisdom combined with modern mycelium science. Each variety offers unique nutritional 
                benefits and contributes to sustainable agriculture.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">🔬 Mycelium Innovation</h3>
              <p className="text-white/90 leading-relaxed">
                Our mycelium lab develops revolutionary bio-materials and supplements. From packaging 
                alternatives to health supplements, we're pioneering the future of sustainable innovation 
                through fungal networks.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 spore-pattern opacity-20"></div>
      </div>

      {/* Health Benefits Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-forest-green/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-forest-green">
              <Heart className="h-5 w-5" />
              Heart Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Rich in beta-glucans, our mushrooms support cardiovascular health and help maintain healthy cholesterol levels.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-spore-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-spore-gold">
              <Brain className="h-5 w-5" />
              Brain Function
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lion's Mane and other varieties contain compounds that support cognitive function and neural health.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-mushroom-brown/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mushroom-brown">
              <Shield className="h-5 w-5" />
              Immune Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Packed with antioxidants and polysaccharides that naturally boost your immune system's defenses.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Catalog & Customer Management</h2>
          <p className="text-muted-foreground">Manage our premium mushroom products and valued customers</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Customer Community</h2>
              <p className="text-sm text-muted-foreground">Building relationships with mushroom enthusiasts and businesses</p>
            </div>
            <Button onClick={() => openCustomerDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Customer Education Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200 mb-6">
            <h3 className="text-lg font-semibold text-forest-green mb-4">🌱 Why Choose Mycopath Mushrooms?</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-mushroom-brown mb-2">🏔️ Mountain-Grown Quality</h4>
                <p className="text-muted-foreground">
                  Our mushrooms are cultivated in Nepal's pristine mountain environment, where clean air and 
                  optimal conditions create nutrient-dense, high-quality fungi with superior taste and health benefits.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-mushroom-brown mb-2">🔬 Science-Backed Cultivation</h4>
                <p className="text-muted-foreground">
                  Using advanced mycelium research and traditional wisdom, we optimize growing conditions 
                  to maximize bioactive compounds like beta-glucans, polysaccharides, and adaptogens.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-mushroom-brown mb-2">🌍 Sustainable Innovation</h4>
                <p className="text-muted-foreground">
                  Beyond food, our mycelium lab creates eco-friendly materials like biodegradable packaging, 
                  leather alternatives, and building materials, supporting a circular economy.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-mushroom-brown mb-2">💚 Health & Wellness</h4>
                <p className="text-muted-foreground">
                  Rich in protein, antioxidants, and immune-supporting compounds, our mushrooms offer 
                  natural solutions for cognitive health, stress management, and overall vitality.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {customers.map((customer: Customer) => (
              <Card key={customer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {customer.name}
                        <Badge variant={customer.isActive ? "default" : "secondary"}>
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {customer.customerType.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {customer.email && <div>Email: {customer.email}</div>}
                        {customer.phone && <div>Phone: {customer.phone}</div>}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openCustomerDialog(customer)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCustomerMutation.mutate(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {customer.address && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Address: {customer.address}</p>
                    {customer.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {customer.notes}</p>}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Premium Mushroom Catalog</h2>
              <p className="text-sm text-muted-foreground">Sustainably grown, scientifically optimized</p>
            </div>
            <Button onClick={() => openProductDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Educational Product Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  🍄 Fresh Varieties
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>• <strong>Oyster:</strong> High protein, immune boost</div>
                <div>• <strong>Shiitake:</strong> Heart health, umami rich</div>
                <div>• <strong>Lion's Mane:</strong> Brain function support</div>
                <div>• <strong>Reishi:</strong> Stress relief, longevity</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  ✨ Processing Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>• <strong>Air-dried:</strong> Preserves nutrients</div>
                <div>• <strong>Freeze-dried:</strong> Maximum potency</div>
                <div>• <strong>Extract powder:</strong> Concentrated benefits</div>
                <div>• <strong>Capsules:</strong> Convenient dosing</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  🔬 Innovation Lab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>• <strong>Bio-packaging:</strong> Plastic alternative</div>
                <div>• <strong>Leather substitute:</strong> Mycelium-based</div>
                <div>• <strong>Building materials:</strong> Sustainable blocks</div>
                <div>• <strong>Research kits:</strong> Educational tools</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {products.map((product: Product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {product.name}
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {product.category.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        NPR {product.sellingPrice} per {product.unit}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openProductDialog(product)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Stock:</span> {product.currentStock} {product.unit}
                    </div>
                    <div>
                      <span className="font-medium">Min Stock:</span> {product.minimumStock} {product.unit}
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          <div className="grid gap-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{order.orderNumber}</CardTitle>
                        <CardDescription>
                          Total: NPR {order.totalAmount}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer Dialog */}
      <Dialog open={activeDialog === "customer"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit((data) => customerMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="customerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="retailer">Retailer</SelectItem>
                          <SelectItem value="distributor">Distributor</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="customer@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={customerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Customer address" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="preferredPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cash, Bank Transfer, Mobile Money" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about the customer" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Customer</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Customer can place new orders
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={customerMutation.isPending}>
                  {customerMutation.isPending ? "Saving..." : editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={activeDialog === "product"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit((data) => productMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fresh_mushrooms">🍄 Fresh Mushrooms</SelectItem>
                          <SelectItem value="powder">✨ Mushroom Powder & Extracts</SelectItem>
                          <SelectItem value="packaging_kit">📦 Mycelium Packaging Materials</SelectItem>
                          <SelectItem value="supplements">💊 Health Supplements</SelectItem>
                          <SelectItem value="growing_kits">🌱 Home Growing Kits</SelectItem>
                          <SelectItem value="biomaterials">🔬 Bio-materials & Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Product description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={productForm.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (NPR) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price (NPR)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="grams">Grams</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="minimumStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Alert</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={productForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Product</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Product is available for sale
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={productMutation.isPending}>
                  {productMutation.isPending ? "Saving..." : editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}