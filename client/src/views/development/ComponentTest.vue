<script setup lang="ts">
import Card from '@/components/design/card/Card.vue';
import FileInput from '@/components/design/input/FileInput.vue';
import ListItem from '@/components/design/list/ListItem.vue';

</script>

<template>
    <p class="title">Alerts</p>
    <div class="flex flex-column gap-2">
        <Alert type="info">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="warning">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="error">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="success">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="info" dismissible>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="warning" dismissible>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="error" dismissible>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
        <Alert type="success" dismissible>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
        </Alert>
    </div>
    <p class="title">Buttons</p>
    <div class="flex flex-column gap-2">
        <Button>Test</Button>
        <div>
            <Button>Test</Button>
        </div>
        <Button color="neutral">Test</Button>
        <div>
            <Button color="neutral">Test</Button>
        </div>
        <Button color="transparent">Test</Button>
        <div>
            <Button color="transparent">Test</Button>
        </div>
        <Button icon="home">Test</Button>
        <div>
            <Button icon="home">Test</Button>
        </div>
        <Button color="neutral" icon="home">Test</Button>
        <div>
            <Button color="neutral" icon="home">Test</Button>
        </div>
        <Button color="transparent" icon="home">Test</Button>
        <div>
            <Button color="transparent" icon="home">Test</Button>
        </div>

        
        <Button dense>Test</Button>
        <div>
            <Button dense>Test</Button>
        </div>
        <Button color="neutral" dense>Test</Button>
        <div>
            <Button color="neutral" dense>Test</Button>
        </div>
        <Button color="transparent" dense>Test</Button>
        <div>
            <Button color="transparent" dense>Test</Button>
        </div>
        <Button icon="home" dense>Test</Button>
        <div>
            <Button icon="home" dense>Test</Button>
        </div>
        <Button color="neutral" icon="home" dense>Test</Button>
        <div>
            <Button color="neutral" icon="home" dense>Test</Button>
        </div>
        <Button color="transparent" icon="home" dense>Test</Button>
        <div>
            <Button color="transparent" icon="home" dense>Test</Button>
        </div>
        
        <Button disabled>Test</Button>
        <div>
            <Button disabled>Test</Button>
        </div>
        <Button color="neutral" disabled>Test</Button>
        <div>
            <Button color="neutral" disabled>Test</Button>
        </div>
        <Button color="transparent" disabled>Test</Button>
        <div>
            <Button color="transparent" disabled>Test</Button>
        </div>
        <Button icon="home" disabled>Test</Button>
        <div>
            <Button icon="home" disabled>Test</Button>
        </div>
        <Button color="neutral" icon="home" disabled>Test</Button>
        <div>
            <Button color="neutral" icon="home" disabled>Test</Button>
        </div>
        <Button color="transparent" icon="home" disabled>Test</Button>
        <div>
            <Button color="transparent" icon="home" disabled>Test</Button>
        </div>
        
        <Button loading>Test</Button>
        <div>
            <Button loading>Test</Button>
        </div>
        <Button color="neutral" loading>Test</Button>
        <div>
            <Button color="neutral" loading>Test</Button>
        </div>
        <Button color="transparent" loading>Test</Button>
        <div>
            <Button color="transparent" loading>Test</Button>
        </div>
        <Button icon="home" loading>Test</Button>
        <div>
            <Button icon="home" loading>Test</Button>
        </div>
        <Button color="neutral" icon="home" loading>Test</Button>
        <div>
            <Button color="neutral" icon="home" loading>Test</Button>
        </div>
        <Button color="transparent" icon="home" loading>Test</Button>
        <div>
            <Button color="transparent" icon="home" loading>Test</Button>
        </div>
        <Button icon="home" loading>Test</Button>
        <div>
            <Button icon="home" loading>Test</Button>
        </div>
        <Button loading dense>Test</Button>
        <div>
            <Button loading dense>Test</Button>
        </div>

        
        
        <Button active>Test</Button>
        <div>
            <Button active>Test</Button>
        </div>
        <Button color="neutral" active>Test</Button>
        <div>
            <Button color="neutral" active>Test</Button>
        </div>
        <Button color="transparent" active>Test</Button>
        <div>
            <Button color="transparent" active>Test</Button>
        </div>
        <Button icon="home" active>Test</Button>
        <div>
            <Button icon="home" active>Test</Button>
        </div>
        <Button color="neutral" icon="home" active>Test</Button>
        <div>
            <Button color="neutral" icon="home" active>Test</Button>
        </div>
        <Button color="transparent" icon="home" active>Test</Button>
        <div>
            <Button color="transparent" icon="home" active>Test</Button>
        </div>
    </div>
    <p class="title">Cards</p>
    <Card fluid>
        <p class="title">Lorem ipsum dolor sit </p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?</p>
    </Card>
    <p class="title">Alerts in cards</p>
    <Card fluid>
        <div class="flex flex-column gap-2">
            <Alert type="info">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
            </Alert>
            <Alert type="warning">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
            </Alert>
            <Alert type="error">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
            </Alert>
            <Alert type="success">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?
            </Alert>
        </div>
    </Card>
    <p class="title">Buttons in cards</p>
    <Card fluid>
        <div class="flex flex-column gap-2">
        <Button>Test</Button>
        <div>
            <Button>Test</Button>
        </div>
        <Button color="neutral">Test</Button>
        <div>
            <Button color="neutral">Test</Button>
        </div>
        <Button color="transparent">Test</Button>
        <div>
            <Button color="transparent">Test</Button>
        </div>
        <Button icon="home">Test</Button>
        <div>
            <Button icon="home">Test</Button>
        </div>
        <Button color="neutral" icon="home">Test</Button>
        <div>
            <Button color="neutral" icon="home">Test</Button>
        </div>
        <Button color="transparent" icon="home">Test</Button>
        <div>
            <Button color="transparent" icon="home">Test</Button>
        </div>

        
        <Button dense>Test</Button>
        <div>
            <Button dense>Test</Button>
        </div>
        <Button color="neutral" dense>Test</Button>
        <div>
            <Button color="neutral" dense>Test</Button>
        </div>
        <Button color="transparent" dense>Test</Button>
        <div>
            <Button color="transparent" dense>Test</Button>
        </div>
        <Button icon="home" dense>Test</Button>
        <div>
            <Button icon="home" dense>Test</Button>
        </div>
        <Button color="neutral" icon="home" dense>Test</Button>
        <div>
            <Button color="neutral" icon="home" dense>Test</Button>
        </div>
        <Button color="transparent" icon="home" dense>Test</Button>
        <div>
            <Button color="transparent" icon="home" dense>Test</Button>
        </div>
        
        <Button disabled>Test</Button>
        <div>
            <Button disabled>Test</Button>
        </div>
        <Button color="neutral" disabled>Test</Button>
        <div>
            <Button color="neutral" disabled>Test</Button>
        </div>
        <Button color="transparent" disabled>Test</Button>
        <div>
            <Button color="transparent" disabled>Test</Button>
        </div>
        <Button icon="home" disabled>Test</Button>
        <div>
            <Button icon="home" disabled>Test</Button>
        </div>
        <Button color="neutral" icon="home" disabled>Test</Button>
        <div>
            <Button color="neutral" icon="home" disabled>Test</Button>
        </div>
        <Button color="transparent" icon="home" disabled>Test</Button>
        <div>
            <Button color="transparent" icon="home" disabled>Test</Button>
        </div>
        
        <Button loading>Test</Button>
        <div>
            <Button loading>Test</Button>
        </div>
        <Button color="neutral" loading>Test</Button>
        <div>
            <Button color="neutral" loading>Test</Button>
        </div>
        <Button color="transparent" loading>Test</Button>
        <div>
            <Button color="transparent" loading>Test</Button>
        </div>
        <Button icon="home" loading>Test</Button>
        <div>
            <Button icon="home" loading>Test</Button>
        </div>
        <Button color="neutral" icon="home" loading>Test</Button>
        <div>
            <Button color="neutral" icon="home" loading>Test</Button>
        </div>
        <Button color="transparent" icon="home" loading>Test</Button>
        <div>
            <Button color="transparent" icon="home" loading>Test</Button>
        </div>
        <Button icon="home" loading>Test</Button>
        <div>
            <Button icon="home" loading>Test</Button>
        </div>
        <Button loading dense>Test</Button>
        <div>
            <Button loading dense>Test</Button>
        </div>

        
        
        <Button active>Test</Button>
        <div>
            <Button active>Test</Button>
        </div>
        <Button color="neutral" active>Test</Button>
        <div>
            <Button color="neutral" active>Test</Button>
        </div>
        <Button color="transparent" active>Test</Button>
        <div>
            <Button color="transparent" active>Test</Button>
        </div>
        <Button icon="home" active>Test</Button>
        <div>
            <Button icon="home" active>Test</Button>
        </div>
        <Button color="neutral" icon="home" active>Test</Button>
        <div>
            <Button color="neutral" icon="home" active>Test</Button>
        </div>
        <Button color="transparent" icon="home" active>Test</Button>
        <div>
            <Button color="transparent" icon="home" active>Test</Button>
        </div>
        </div>
    </Card>
    <p class="title">Checkbox</p>
    <Checkbox label="Test"></Checkbox>
    <Checkbox label="Test" disabled></Checkbox>
    <Checkbox label="Test" :value="true"></Checkbox>
    
    <p class="title">Checkbox in cards</p>
    <Card fluid>
        <div class="flex flex-column gap-2">
            <Checkbox label="Test"></Checkbox>
            <Checkbox label="Test" disabled></Checkbox>
            <Checkbox label="Test" :value="true"></Checkbox>
        </div>
    </Card>

    <p class="title">Dialog</p>

    <Dialog>
        <template #activator="{ toggle }">
            <Button @click="toggle">Open Dialog</Button>
        </template>
        <template #default>
            <p>Lorem</p>
        </template>
    </Dialog>
    <Dialog>
        <template #activator="{ toggle }">
            <Button @click="toggle">Open Dialog</Button>
        </template>
        <template #default>
            <Card dialog>
                <p class="title">Lorem ipsum dolor sit </p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?</p>
            </Card>
        </template>
    </Dialog>

    <p class="title">Divider</p>

    <div class="flex flex-column gap-2">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?</p>
        <Divider></Divider>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?</p>
    </div>

    <p class="title">Divider in cards</p>

    <Card fluid>
        <div class="flex flex-column gap-2">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?</p>
            <Divider></Divider>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptatum dolor praesentium? Eaque tempore molestias nisi deserunt neque? Est numquam laborum veniam perferendis repellendus. Placeat eum veniam deleniti obcaecati officiis?</p>
        </div>
    </Card>

    <p class="title">Input</p>

    <div class="flex flex-column gap-2">
        <Input label="Test"></Input>
        <Input label="Test" placeholder="Test"></Input>
        <Input label="Test" placeholder="Test" readonly></Input>
        <Input label="Test" placeholder="Test" value="Filled in"></Input>
        <Input label="Test" placeholder="Test" value="Filled in" readonly></Input>
        <Input label="Test" placeholder="Test" value="Filled in" inline></Input>
        <Input label="Test" placeholder="Test" value="Filled in" hide-label></Input>
        <Input label="Test" placeholder="Test" value="Filled in" required></Input>
        <FileInput label="Test"></FileInput>
        <FileInput label="Test" disabled></FileInput>
    </div>

    

    <p class="title">Input in cards</p>

    <Card fluid>
        <div class="flex flex-column gap-2">
            <Input label="Test"></Input>
            <Input label="Test" placeholder="Test"></Input>
            <Input label="Test" placeholder="Test" readonly></Input>
            <Input label="Test" placeholder="Test" value="Filled in"></Input>
            <Input label="Test" placeholder="Test" value="Filled in" readonly></Input>
            <Input label="Test" placeholder="Test" value="Filled in" inline></Input>
            <Input label="Test" placeholder="Test" value="Filled in" hide-label></Input>
            <Input label="Test" placeholder="Test" value="Filled in" required></Input>
            <FileInput label="Test"></FileInput>
            <FileInput label="Test" disabled></FileInput>
        </div>
    </Card>

    <p class="title">List</p>
        <div class="flex flex-column gap-2">
            <List>
            <ListItem>Test</ListItem>
            <ListItem active>Test</ListItem>
            <ListItem hover>Test</ListItem>
            <ListItem mark>Test</ListItem>
            <ListItem hover active>Test</ListItem>
            <ListItem mark active>Test</ListItem>
            <ListItem mark hover>Test</ListItem>
        </List>

        <List dense>
            <ListItem>Test</ListItem>
            <ListItem active>Test</ListItem>
            <ListItem hover>Test</ListItem>
            <ListItem mark>Test</ListItem>
            <ListItem hover active>Test</ListItem>
            <ListItem mark active>Test</ListItem>
            <ListItem mark hover>Test</ListItem>
        </List>
    </div>

    <p class="title">List in cards</p>

    <Card fluid>
        
        <div class="flex flex-column gap-2">
            <List>
            <ListItem>Test</ListItem>
            <ListItem active>Test</ListItem>
            <ListItem hover>Test</ListItem>
            <ListItem mark>Test</ListItem>
            <ListItem hover active>Test</ListItem>
            <ListItem mark active>Test</ListItem>
            <ListItem mark hover>Test</ListItem>
        </List>

        <List dense>
            <ListItem>Test</ListItem>
            <ListItem active>Test</ListItem>
            <ListItem hover>Test</ListItem>
            <ListItem mark>Test</ListItem>
            <ListItem hover active>Test</ListItem>
            <ListItem mark active>Test</ListItem>
            <ListItem mark hover>Test</ListItem>
        </List>
    </div>
    </Card>

    <p class="title">Pagination</p>

    <Pagination :total="300" :page="1" :pageSize="30"></Pagination>

    <p class="title">Pagination in cards</p>

    <Card fluid>
        <Pagination :total="300" :page="1" :pageSize="30"></Pagination>
    </Card> 

    <p class="title">Select</p>

    <Select label="Test" :choices="[{value: 'test', name: 'Test'}]"></Select>
    <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" :value="'test'"></Select>
    <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" disabled></Select>
    <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" multiple></Select>
    <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" multiple hide-label></Select>

    <p class="title">Select in cards</p>

    <Card fluid>
        <Select label="Test" :choices="[{value: 'test', name: 'Test'}]"></Select>
        <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" :value="'test'"></Select>
        <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" disabled></Select>
        <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" multiple></Select>
        <Select label="Test" :choices="[{value: 'test', name: 'Test'}]" multiple hide-label></Select>
    </Card>

    <p class="title">Tabs</p>

    <Tabs :items="[{text: 'Test', value: 'test'}, {text: 'Test2', value: 'test2'}]" :selected="'test'"></Tabs>
    <Tabs :items="[{text: 'Test', value: 'test'}, {text: 'Test2', value: 'test2'}]" :selected="'test'" fluid></Tabs>

    <p class="title">Tabs in cards</p>

    <Card fluid>
        <Tabs :items="[{text: 'Test', value: 'test'}, {text: 'Test2', value: 'test2'}]" :selected="'test'"></Tabs>
        <Tabs :items="[{text: 'Test', value: 'test'}, {text: 'Test2', value: 'test2'}]" :selected="'test'" fluid></Tabs>
    </Card>
</template>

<style lang="scss" scoped>
p.title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    margin-top: 2rem;

    &:first-of-type {
        margin-top: 0;
    }
}
</style>