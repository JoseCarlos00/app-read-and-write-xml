import TableComponent from './Table';

function ViewSummary({ content }) {
  console.log('ViewSummary', { content });

  return (
    <div style={{ maxWidth: '700px', marginRight: 'auto', marginLeft: 'auto' }}>
      <TableComponent />
    </div>
  );
}

export default ViewSummary;
